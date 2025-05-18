# CoatCheck 

This is a simple system designed to assist the handling of the VF2025 Coat-Check.

## Usage

To use the tool, clone the repository and then use the provided make scripts to build and deploy.

There are two components, the Frontend written in JavaScript and the Backend that is based around the Pocketbase Go-Backend with some custom extensions. 

To build the frontend code use `make frontend`.
To build the backend code use `make backend`.
To build both at the same time and pack into a zip file that can be deployed use `make release`.

It is possible to cross-compile for other platforms using the GOOS and GOARCH environment variables, though anything other than linux as os is not tested and might not work. 

## First time configuration

On the first start of the application you will be provided with one-time setup URL. Using that you can create the first Superuser. Using that superuser other users can be created. To do this the administration UI at the sub-url /_/ can be used. 

## Systemd-service

Use the included systemd.service as a starting point. Just install that to /etc/systemd/system/coatcheck.service and install the release file to /opt/coatcheck.

Then you can simply use `systemctl enable --now coatcheck.service` to start the service and enable autostart.

## Audit Logs

All operations of the system create a audit log entry, that can be viewed by the superusers. It logs every change including what changed and by whom. 

## Telegram Bot

The service can send a message to a telgram group or chat everytime an object (be it a pass or an item) is created. To make use of that feature the environment variables TG_BOT_TOKEN and TG_CHAT_ID must be set. 

## ESCPOS Printer

There is also support to connect a escpos compatible printer to the device. It will print audit logs just like the Telegram Bot.

