import PocketBase, { AuthMethodsList } from 'pocketbase'
import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js';
import z from "zod";
import themes from "./themes.module.css?raw";
import * as pbf from "@nedpals/pbf";

import { useRecords } from "@hibas123/solid-pb";

const [theme, setTheme] = createSignal("light");
export function toggleTheme() {
   const theme = localStorage.getItem("theme");
   if (theme === "dark") {
      localStorage.setItem("theme", "light");
   } else {
      localStorage.setItem("theme", "dark");
   }
   applyTheme();
}

const themeElement = document.createElement("style");
document.head.append(themeElement);
function applyTheme() {
   const theme = localStorage.getItem("theme");
   const theme_name = theme === "dark" ? "dark" : "light";
   setTheme(theme_name);

   themeElement.innerHTML = themes.replace(`:root.${theme_name}`, `:root`);
}

applyTheme();

export function useTheme() {
   return theme;
}

const DayValidator = z.object({
   id: z.string(),
   name: z.string(),
   start_at: z.coerce.date(),
   end_at: z.coerce.date(),
   created: z.coerce.date(),
   deleted: z.coerce.date().optional(),
})

export type Day = z.infer<typeof DayValidator>;

const ItemValidator = z.object({
   id: z.string(),
   uid: z.string().regex(/^[0-9]+$/),
   ticket_id: z.string().regex(/^[A-Z]?[0-9]+$/),
   ticket_color: z.enum(["pink", "blue", "white"]),
   returned_at: z.union([z.literal(""), z.coerce.date().optional()]),
   day: z.string(),
   daypass: z.boolean(),
   created: z.coerce.date(),
   deleted: z.coerce.date().optional(),
})

const ItemValidatorExt = ItemValidator.extend({
   expand: z.object({
      day: DayValidator,
   })
})

export type Item = z.infer<typeof ItemValidator>;
export type ItemExp = z.infer<typeof ItemValidatorExt>;

export type TicketColors = Item["ticket_color"];

export const DayPassValidator = z.object({
   id: z.string(),
   day: z.string(),
   uid: z.string().regex(/^[0-9]+$/),
   created: z.coerce.date(),
   deleted: z.coerce.date().optional(),
});

export const DayPassValidatorExt = DayPassValidator.extend({
   expand: z.object({
      day: DayValidator,
   })
})

export type DayPass = z.infer<typeof DayPassValidator>;
export type DayPassExpand = z.infer<typeof DayPassValidatorExt>;

export const WeekPassValidator = z.object({
   id: z.string(),
   uid: z.string().regex(/^[0-9]+$/),
   staff: z.boolean().default(false),
   created: z.coerce.date(),
   deleted: z.coerce.date().optional(),
});
export type WeekPass = z.infer<typeof WeekPassValidator>;

const pocketbaseUrl = new URL("/", window.location.href);
export const pb = new PocketBase(pocketbaseUrl.href);
pb.autoCancellation(false);

export function useAuthMethods() {
   const [state, setState] = createSignal<AuthMethodsList | null>(null);

   createEffect(() => {
      let prom = pb.collection("users").listAuthMethods();
      prom.then((res) => {
         setState(res)
      })
   })

   return state;
}

export function useAuthState() {
   const [state, setState] = createSignal(pb.authStore.isValid ? pb.authStore.record : null);

   createEffect(() => {
      const unsub = pb.authStore.onChange((_cb: any) => {
         setState(pb.authStore.isValid ? pb.authStore.record : null)
      });

      onCleanup(() => {
         unsub()
      });
   });

   return state;
}

function reloadHandler<T>(reloadFunc: () => Promise<T>, valueSetter: (value: T) => void, errorSetter?: (error: any) => void) {
   let idx = 0;

   let cancel = false;

   return {
      cancel: () => cancel = true,
      trigger: () => {
         const myIdx = ++idx;

         reloadFunc().then((res) => {
            if (!cancel && idx === myIdx)
               valueSetter(res)
         }).catch((err) => {
            console.error(err)
            if (!cancel && idx === myIdx && errorSetter)
               errorSetter(err)
         });
      }
   }
}


export const useDays = () => useRecords<Day>("days", {
   validator: DayValidator
});
export const useWeekpasses = () => useRecords<WeekPass>("week_passes", { validator: WeekPassValidator });
export const useDaypasses = (day: Day) => useRecords<DayPassExpand>("day_passes", {
   validator: DayPassValidatorExt,
   filter: () => pbf.eq("day", day.id),
   expand: ["day"]
});
export function useItems(
   color_filter: Accessor<TicketColors | null>,
   uid_filter: Accessor<string | null>,
   ticket_id_filter: Accessor<string | null>,
   ticket_id_fuzzy: boolean,
   day_filter: Accessor<string | null>,
   returned_filter: Accessor<boolean | null>,
) {
   const filter = () => {
      const filter_and = [] as pbf.Filter[];
      if (color_filter()) {
         filter_and.push(pbf.eq("ticket_color", color_filter()))
      }

      if (uid_filter()) {
         filter_and.push(pbf.like("uid", uid_filter()))
      }

      if (ticket_id_filter()) {
         if (ticket_id_fuzzy) {
            filter_and.push(pbf.like("ticket_id", ticket_id_filter()))
         } else {
            filter_and.push(pbf.eq("ticket_id", ticket_id_filter()))
         }
      }

      if (day_filter()) {
         filter_and.push(pbf.eq("day", day_filter()))
      }

      if (returned_filter() === true) {
         filter_and.push(pbf.not(pbf.eq("returned_at", null)))
      } else if (returned_filter() === false) {
         filter_and.push(pbf.eq("returned_at", null))
      }

      if (filter_and.length === 0) return undefined;
      if (filter_and.length === 1) return filter_and[0];
      return pbf.and(...filter_and);
   }


   return useRecords<ItemExp>("items", {
      filter,
      validator: ItemValidatorExt,
      expand: ["day"]
   });
}


export function useUIDLookup(uid: () => string, daypass_filter?: () => Day) {
   const items = useRecords<ItemExp>("items", {
      validator: ItemValidatorExt,
      filter: () => pbf.eq("uid", uid()),
      expand: ["day"]
   });
   const uid_filter = () => pbf.eq("uid", uid());
   const daypasses = useRecords<DayPassExpand>("day_passes", {
      validator: DayPassValidatorExt,
      filter: () => daypass_filter ? pbf.and(uid_filter(), pbf.eq("day", daypass_filter()!.id)) : uid_filter(),
      expand: ["day"]
   });

   const weekpasses = useRecords<WeekPass>("week_passes", {
      validator: WeekPassValidator,
      filter: () => pbf.eq("uid", uid())
   });

   const loading = () => items.loading || daypasses.loading || weekpasses.loading;

   return {
      loading,
      items,
      daypasses,
      weekpasses
   }
}

(window as any).pb = pb;
(window as any).burnin = async () => {
   const COUNT = 10000;

   console.log("Starting burnin and creating ", COUNT, " items");

   const days = await pb.collection("days").getFullList();
   const day = days[0]
   if (!day) {
      console.error("No days found");
      return
   }

   const start = performance.now();
   for (let i = 0; i < COUNT; i++) {
      await pb.collection("items").create({
         uid: Math.floor(Math.random() * 1000000).toString(),
         ticket_id: i,
         ticket_color: ["pink", "blue", "white"][Math.floor(Math.random() * 3)],
         day: day.id,
         daypass: true,
      });
   }
   const end = performance.now();

   console.log(`Burnin done in ${end - start}ms`)
   console.log("Items created: ", COUNT);
   console.log("Items per second: ", COUNT / ((end - start) / 1000));
   console.log("MS per Item ", (end - start) / COUNT);
}