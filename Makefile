.PHONY: generate init install

# Generate output files from content + config
generate:
	bun src/generate.ts --local

# Install generated files to user config
init:
	bun src/init.ts --local

# Generate and install (shortcut)
install: generate init
