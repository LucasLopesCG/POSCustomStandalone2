# POSCustomStandalone

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.7.

## STEPS TO RUN LOCALLY

1 - install node on your machine. go to: https://nodejs.org/en/download/package-manager and download node.js on your machine.
2 - download the code into a local folder.
3 - find "node.js command prompt" program on your machine. Navigate to the folder from step 2 utilizing command "cd" to navigate folders.
"cd .." returns you to the previous folder while "cd FOLDERNAMEHERE" navigates you to the typed folder. typing "dir" will list folders and files in the current location
4 - Once at the folder location of the project, type in "npm i" - this will install all dependencies of the project on your local machine
5 - type in "ng serve" to build the project and host it within "http://localhost:4200/". You may then navigate to this address on the browser of your choice.
6 - the command to copy (ctrl+c) stops execution of the project.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.
These 'dist' files can then be saved into a webserver to have a website that can be reached by anyone.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.

STAGING DEPLOY COMMAND: npm start -- --port 3001 --host 0.0.0.0 --disable-host-check
pm2 start npm --name "my-app" -- start -- --port 3001 --host 0.0.0.0 --disable-host-check
