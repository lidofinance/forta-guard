tools:
	cd tools && go mod tidy && go mod vendor && go mod verify && go generate -tags tools
.PHONY: tools

.PHONY: check_alerts_syntax
check_alerts_syntax:
	./bin/promtool check rules ./alerts.yml

.PHONY: test_alerts
test_alerts:
	bin/promtool test rules ./alerts_tests.yml