backend:
	go build -o coatcheck .

frontend:
	yarn install
	yarn build

release: backend frontend
	mkdir -p release
	cp coatcheck release/
	cp -r pb_public release/
	zip -r release.zip release
	rm -rf release
	
install: backend frontend
	mkdir -p /opt/coatcheck
	cp coatcheck /opt/coatcheck/
	cp -r pb_public /opt/coatcheck/
	cp -r pb_migrations /opt/coatcheck/
	# Only copy service file if it doesn't exist
	[ -f /etc/systemd/system/coatcheck.service ] || cp coatcheck.service /etc/systemd/system/