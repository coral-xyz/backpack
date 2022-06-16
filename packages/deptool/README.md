# deptool

an internal tool to recursively collect and list all the local imports used by a file in this repository

## usage

add `"@coral-xyz/deptool": "*"` to `package.json` in one of the packages

run `yarn` and then `npx deptool [input-file]` (note: the script shouldn't take more than a couple of seconds, you might have to cancel it manually if it hangs)

open `deptool-report.html` in your browser
