package main

import (
	"context"
	"log"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"sync"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"

	"github.com/go-telegram/bot"
	"github.com/go-telegram/bot/models"

	escpos "github.com/mect/go-escpos"
)

var printer_lock sync.Mutex
var printer *escpos.Printer = nil

var tg_bot *bot.Bot = nil
var tg_chat_id int64 = 0

func insertAuditlog(
	app core.App,
	auth *core.Record,
	record *core.Record,
	event string,
) error {
	if record.Collection().Name == "auditlog" {
		return nil // ignore audi	tlog record changes
	}

	auditlogCollection, err := app.FindCollectionByNameOrId("auditlog")
	if err != nil {
		return err
	}

	var adminId string
	var authRecordId string

	// get the authenticated admin

	if auth.IsSuperuser() {
		adminId = auth.Id
	} else {
		authRecordId = auth.Id
	}

	auditlog := core.NewRecord(auditlogCollection)
	auditlog.Set("collection", record.Collection().Name)
	auditlog.Set("record", record.Id)
	auditlog.Set("event", event)
	auditlog.Set("user", authRecordId)
	auditlog.Set("admin", adminId)
	auditlog.Set("data", record)
	auditlog.Set("printed", false)
	auditlog.Set("telegram", false)

	err = app.Save(auditlog)
	if err != nil {
		return err
	}

	if record.Collection().Name == "week_passes" || record.Collection().Name == "day_passes" {
		if tg_bot != nil {
			// send a message to the telegram bot

			if record.Collection().Name == "week_passes" {

				staff := ""
				if record.Get("staff") != nil && record.Get("staff").(bool) {
					staff = "(Staff)"
				}

				_, err := tg_bot.SendMessage(context.Background(), &bot.SendMessageParams{
					ChatID: tg_chat_id,
					Text:   "WeekPass " + event + " for Badge: " + record.Get("uid").(string) + staff,
				})

				if err != nil {
					goto telegram_err
				}
			} else {
				dayId := record.Get("day")
				dayCollection, err := app.FindCollectionByNameOrId("days")

				if err != nil {
					goto telegram_err
				}

				dayRecord, err := app.FindRecordById(dayCollection, dayId.(string))

				if err != nil {
					goto telegram_err
				}

				_, err = tg_bot.SendMessage(context.Background(), &bot.SendMessageParams{
					ChatID: tg_chat_id,
					Text:   "DayPass " + event + " for Badge: " + record.Get("uid").(string) + "\nDay: " + dayRecord.Get("name").(string),
				})

				if err != nil {
					goto telegram_err
				}
			}

		telegram_err:
			if err != nil {
				auditlog.Set("telegram", false)
				log.Println("Error sending message to telegram bot:")
				log.Println(err)
			} else {
				auditlog.Set("telegram", true)
				log.Println("Message sent to telegram bot!")
			}
		}

		printer_lock.Lock()
		defer printer_lock.Unlock()
		if printer == nil {

			pr, err := escpos.NewUSBPrinterByPath("") // empty string will do a self discovery
			if err != nil {
				log.Println("Error opening printer:")
				log.Println(err)
				printer = nil
			} else {
				printer = pr

				err = printer.Init()
				if err != nil {
					log.Println("Error initializing printer:")
					log.Println(err)
					printer = nil
				}
			}
		}

		if printer != nil {
			log.Println("Printing pass...")

			// if event == "delete" {
			// 	printer.Size(1, 1).Write("Deleted Pass for Badge: ")
			// 	printer.Bold(true).Size(1, 1).Write(record.Get("uid").(string) + "\n")
			// 	printer.Bold(false).Size(1, 1).Write("   Type: " + record.Collection().Name + "\n")
			// }
			//

			err = printer.Smooth(true)
			if err != nil {
				goto print_err
			}
			err = printer.Size(1, 1)
			if err != nil {
				goto print_err
			}
			err = printer.PrintLn(event)
			if err != nil {
				goto print_err
			}
			if record.Collection().Name == "week_passes" {
				err = printer.Print("Week Pass for Badge: ")
				if err != nil {
					goto print_err
				}
				err = printer.Bold(true) // bold on
				if err != nil {
					goto print_err
				}

				staff := ""
				if record.Get("staff") != nil && record.Get("staff").(bool) {
					staff = "(Staff)"
				}

				err = printer.PrintLn(record.Get("uid").(string) + staff)
				if err != nil {
					goto print_err
				}

				err = printer.Bold(false) // bold off
				if err != nil {
					goto print_err
				}
			} else {
				dayId := record.Get("day")
				dayCollection, err := app.FindCollectionByNameOrId("days")
				if err != nil {
					goto print_err
				}

				dayRecord, err := app.FindRecordById(dayCollection, dayId.(string))
				if err != nil {
					goto print_err
				}

				err = printer.Print("Day Pass for Badge: ")
				if err != nil {
					goto print_err
				}
				err = printer.Bold(true)
				if err != nil {
					goto print_err
				}

				err = printer.PrintLn(record.Get("uid").(string))
				if err != nil {
					goto print_err
				}
				err = printer.Bold(false)
				if err != nil {
					goto print_err
				}

				err = printer.PrintLn("   Day: " + dayRecord.Get("name").(string))
				if err != nil {
					goto print_err
				}
			}

			err = printer.Bold(false)
			if err != nil {
				goto print_err
			}

			err = printer.PrintLn("   ID: " + record.Id)
			if err != nil {
				goto print_err
			}
			err = printer.Feed(1)
			if err != nil {
				goto print_err
			}

			err = printer.End()
			if err != nil {
				goto print_err
			}

		print_err:
			if err != nil {
				log.Println("Error printing pass:")
				log.Println(err)
				log.Println("Marking pass as not printed!")
				auditlog.Set("printed", false)
				printer = nil
			} else {
				log.Println("Pass printed!")
				auditlog.Set("printed", true)
			}
		}
	}

	app.Save(auditlog)

	return nil
}

func main() {
	log.Println("Starting CoatCheck...")

	log.Println("")

	var bot_token = os.Getenv("TG_BOT_TOKEN")

	if bot_token != "" {
		log.Println("Starting Telegram bot...")

		ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt)
		defer cancel()

		chat_id_raw := os.Getenv("TG_CHAT_ID")
		chat_id, err := strconv.ParseInt(chat_id_raw, 10, 64)
		if err != nil {
			log.Println("Error parsing chat id:")
			log.Println(err)
		} else {
			tg_chat_id = chat_id
		}

		opts := []bot.Option{
			bot.WithDefaultHandler(handler),
		}
		bot_i, err := bot.New(bot_token, opts...)
		if err != nil {
			log.Println("Error starting telegram bot:")
			log.Println(err)
		} else {
			log.Println("Telegram bot started!")
			tg_bot = bot_i
		}

		go bot_i.Start(ctx)
	}

	app := pocketbase.New()

	log.Println("Starting PocketBase...")
	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir()) // loosly check if running in go run

	log.Println("Registering plugins...")
	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir: "./pb_migrations",
		HooksDir:      "./pb_hooks",
		HooksWatch:    isGoRun,
		HooksPoolSize: 25,
	})

	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		// enable auto creation of migration files when making collection changes in the Admin UI
		// (the isGoRun check is to enable it only during development)
		TemplateLang: migratecmd.TemplateLangJS,
		Automigrate:  isGoRun,
		Dir:          "pb_migrations",
	})
	app.OnRecordCreateRequest().BindFunc(func(e *core.RecordRequestEvent) error {
		err := e.Next()
		if err != nil {
			return err
		}

		return insertAuditlog(app, e.Auth, e.Record, "create")
	})

	app.OnRecordUpdateRequest().BindFunc(func(e *core.RecordRequestEvent) error {
		err := e.Next()
		if err != nil {
			return err
		}

		return insertAuditlog(app, e.Auth, e.Record, "update")
	})

	app.OnRecordDeleteRequest().BindFunc(func(e *core.RecordRequestEvent) error {
		err := e.Next()
		if err != nil {
			return err
		}

		return insertAuditlog(app, e.Auth, e.Record, "delete")
	})

	app.OnServe().BindFunc(func(e *core.ServeEvent) error {
		e.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		return e.Next()
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func handler(ctx context.Context, b *bot.Bot, update *models.Update) {
	log.Println("Received message from chat: " + strconv.FormatInt(update.Message.Chat.ID, 10))
	log.Println("Message: " + update.Message.Text)
	b.SendMessage(ctx, &bot.SendMessageParams{
		ChatID: update.Message.Chat.ID,
		Text:   "Your Chat ID is: " + strconv.FormatInt(update.Message.Chat.ID, 10),
	})
}
