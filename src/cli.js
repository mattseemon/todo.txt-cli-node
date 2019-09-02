#!/usr/bin/env node
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

const log = require('./modules/logger');
const commander = require('./modules/commander');
const helper = require('./modules/helper');

const run = () => {
    console.log('');

    let configPath = path.resolve(process.cwd(), 'todo.config.json');
    let command = commander.parse(process.argv.slice(2));
    
    if(command.Options.Help) {
        helper.showHelp(command.Action);
    }
    if(command.Options.Version) {
        helper.showVersion();
    }
    if(command.Options.License) {
        helper.showLicense();
    }

    helper.showBanner();

    //Convert from relative to absolute path for config file.
    command.Options.Config = path.resolve(process.cwd(), (command.Options.Config ? command.Options.Config : configPath));

    global.config = helper.initialize(command);

    let fileExists = true;
    if(!fs.existsSync(global.config.TODO_FILE)) {
        let createFile = true;
        if(global.config.Confirm) {
            let response = helper.prompt({
                message: `File '{blue ${global.config.TODO_FILE.replace(/\\/g, '\\\\')}}' does not exist. Do you want to create it?`,
                choices: [{ label: '&Yes', help: 'Yes. Create the file.' }, { label: '&No', help: 'No. Do not create file and exit the program.' }],
                default: 2
            });

            if(['n', 'no'].includes(response)) {
                fileExists = false;
                createFile = false;
            }
        }

        if(createFile) {
            fs.writeFileSync(global.config.TODO_FILE, '');
            log.info(`Created '{blue ${global.config.TODO_FILE}}' file.`);
        }
    }

    if(!fileExists) {
        throw log.chalkish`TODO File Missing: '{blue ${global.config.TODO_FILE.replace(/\\/g, '\\\\')}}' file is missing or location provided is wrong. Please create the file or update the 'Path' Setting in the configuration file to the location where the file exists.`
    }

    if(!fs.existsSync(global.config.DONE_FILE)) {
        fs.writeFileSync(global.config.DONE_FILE, '');
        log.info(`Created '{blue ${global.config.DONE_FILE}}' file.`);
    }

    helper.cleanFile(global.config.TODO_FILE);
    helper.cleanFile(global.config.DONE_FILE);

    console.log('');
}

try {
    run();
}
catch(error) {
    log.error(error.toString());
    console.log('')
}