#!/usr/bin/env node
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline-sync');

const log = require('./modules/logger');
const commander = require('./modules/commander');
const helper = require('./modules/helper');
const todo = require('./modules/todo');

const run = () => {
    console.log('');

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
    command.Options.Config = path.resolve(process.cwd(), (command.Options.Config ? command.Options.Config : 'todo.config.json'));

    global.config = helper.initialize(command);

    if(!fs.existsSync(global.config.TODO_FILE)) {
        log.info(`todo.txt file not found in location '{blue ${global.config.Path}}'. Initializing folder with empty todo.txt and done.txt.`)

        fs.writeFileSync(global.config.TODO_FILE, '');
        log.info(`Created '{blue ${global.config.TODO_FILE}}' file.`);
        
        if(!fs.existsSync(global.config.DONE_FILE)) {
            fs.writeFileSync(global.config.DONE_FILE, '');
            log.info(`Created '{blue ${global.config.DONE_FILE}}' file.`);
        }
        console.log('');
        process.exit(1);
    }

    helper.cleanFile(global.config.TODO_FILE);
    helper.cleanFile(global.config.DONE_FILE);

    let input = '';
    switch(command.Action) {
        case 'add':
            if(command.Arguments.length == 0 && global.config.Confirm) {
                input = readline.question(log.chalkish`   {bgWhite {black  i }} {reset Add Task:} `);
            } else {
                input = command.Arguments.join(' ');
            }

            todo.add({ todoPath: global.config.TODO_FILE, item: input });
            break;
        case 'addm':
            if(command.Arguments.length == 0 && global.config.Confirm) {
                input = readline.question(log.chalkish`   {bgWhite {black  i }} {reset Add Task:} `);
                if(input.length == 0) {
                    console.log('');
                    helper.showHelp('addm');
                }
            } else {
                input = command.Arguments.join(' ');
            }
            todo.addMultiple({ todoPath: global.config.TODO_FILE, items: input });
            break;
        case 'list':
            todo.showTodos({ search: command.Arguments });
            break;
        case 'listall':
            todo.showTodos({ search: command.Arguments, includeCompletedTasks: true });
            break;
        case 'listpri':
            let priorities = 'A-Z';
            if(command.Arguments.length > 0) {
                let temp = command.Arguments[0].toUpperCase();
                if(temp.match(/^[A-Z]$/) || temp.match(/^[A-Z]-[A-Z]$/)) {
                    priorities = temp.toUpperCase();
                    command.Arguments.shift();
                }
            }
            todo.showTodos({ search: command.Arguments, priorities: priorities });
            break;
        case 'listcon':
            todo.showContexts({ search: command.Arguments });
            break;
        case 'listproj':
            todo.showProjects({ search: command.Arguments });
            break;
        default:
            log.info(`'{yellow ${command.Action}}' feature not implemented yet.`);
            break;
    }

    console.log('');
}

try {
    run();
}
catch(error) {
    log.error(error.toString());
    console.log('')
}