.PHONY: install

# Generate output files and install them to the local user config
install:
	bun src/generate.ts
	bun src/init.ts
