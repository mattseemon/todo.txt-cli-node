const chalk = require('chalk');
const cliFormat = require('cli-format');
const fs = require('fs-extra');
const columnify = require('columnify');
const mergeJSON = require('merge-json');
const path = require('path');
const readline = require('readline-sync');
const os = require('os');

const log = require('./logger');
const package = require('../../package');
const strings = require('../config/todo.strings');

const defaultConfig = {
    Path: process.cwd(),
    Verbose : false,
    Confirm : true,
    AutoArchive : false,
    PreserveLineNumbers : false,
    DateOnAdd : true,
    PriorityOnAdd: false,
    ShowHeaders: false,
    HideContexts : false,
    HideProjects : false,
    HidePriorities : false,
    NoColors : false,
    DefaultSort : 'Item',
    DefaultPriority: 'D',
    Colors : {
        PriorityA : 'yellow',
        PriorityB : 'green',
        PriorityC : 'cyan',
        PriorityX : 'white.bold',
        PriorityNone: 'white',
        Completed: 'gray',
        Notification : 'green',
        Verbose : 'cyan.bold',
        Error : 'red',
        Default : 'white',
        Filtered : 'yellow.bold',
        Prioritized: 'yellowBright'
    }
};

exports.showHelp = (actionName) => {
    this.showBanner();

    let action = strings.usage.actions.find((item) => {
        return item.action === actionName;
    });

    if(actionName && !action) {
        throw format("Invalid action \'%s\'", actionName);
    }

    console.log(cliFormat.wrap(log.chalkish`{bold USAGE:} {yellow ${(actionName ? action.prompt : strings.usage.syntax )}}`));
    console.log('');

    let options;

    if(action) {
        if(action.alias) {
            console.log(cliFormat.wrap(log.chalkish`{bold ALIAS:} {cyan ${action.alias}}`));
            console.log('');
        }
        if(action.description) {
            console.log(cliFormat.wrap(log.chalkish`{bold SUMMARY:}`));
            console.log(cliFormat.wrap(log.chalkish`{gray ${action.description}}`, { paddingLeft: '  ', width: 80 }));
            console.log('');
        }
        if(action.details) {
            console.log(cliFormat.wrap(log.chalkish`{gray ${action.details}}`, { paddingLeft: '  ', width: 80 }));
            console.log('');
        }
        if(action.example) {
            console.log(cliFormat.wrap(log.chalkish`{bold EXAMPLES:}`))
            console.log(cliFormat.wrap(log.chalkish`{gray ${action.example}}`, { paddingLeft: '  ', width: 80 }));
            console.log('');
        }

        options = strings.usage.options.filter((item) => {
            return item.scope.includes(actionName);
        });

        if(options.length > 0) {
            console.log(cliFormat.wrap(log.chalkish`{bold ACTION SPECIFIC OPTIONS:}`));
            console.log(cliFormat.wrap(columnify(options.sort(sortOptions), {
                columns: ["prompt", "description"],
                showHeaders: false,
                config: {
                    prompt: {
                        minWidth: 30,
                        dataTransform: (data) => {
                            return log.chalkish`{green ${data}}`;
                        }
                    },
                    description: {
                        maxWidth: 45,
                        dataTransform: (data) => {
                            return log.chalkish`{white ${data}}`;
                        }
                    }
                }
            }), { paddingLeft: '  ' }));
        }
    }

    options = strings.usage.options.filter((item) => {
        return item.scope.includes('global');
    });

    console.log(cliFormat.wrap(log.chalkish`{bold GLOBAL OPTIONS:}`));
    console.log(cliFormat.wrap(columnify(options.sort(sortOptions), {
        columns: ["prompt", "description"],
        showHeaders: false,
        config: {
            prompt: {
                minWidth: 30,
                dataTransform: (data) => {
                    return log.chalkish`{green ${data}}`;
                }
            },
            description: {
                maxWidth: 45,
                dataTransform: (data) => {
                    return log.chalkish`{white ${data}}`;
                }
            }
        }
    }), { paddingLeft: '  ' }));
    console.log('');

    if(!actionName) {
        console.log(cliFormat.wrap(log.chalkish`{bold ACTIONS:}`));
        console.log(cliFormat.wrap(columnify(strings.usage.actions, {
            columns: ['prompt', 'description', 'alias'],
            showHeaders: true,
            preserveNewLines: true,
            config: {
                prompt: {
                    minWidth: 30,
                    headingTransform: (header) => {
                        return log.chalkish`{bold ${header.toUpperCase()}}`;
                    },
                    dataTransform: (data) => {
                        return log.chalkish`{yellow ${data}}`;
                    }
                },
                description: {
                    maxWidth: 45,
                    headingTransform: (header) => {
                        return log.chalkish`{bold ${header.toUpperCase()}}`;
                    },
                    dataTransform: (data) => {
                        return log.chalkish`{white ${data}}`;
                    }
                },
                alias: {
                    align: 'right',
                    headingTransform: (header) => {
                        return log.chalkish`{bold ${header.toUpperCase()}}`;
                    },
                    dataTransform: (data) => {
                        return log.chalkish`{yellow.bold ${data}}`;
                    }
                }
            }
        }), {
            paddingLeft: '  '
        }));
        console.log('');
    }

    if(!action || action.showTodo) {
        console.log(cliFormat.wrap(log.chalkish`{bold <task> FORMAT:}`));
        console.log(cliFormat.wrap(log.chalkish`{yellow ${strings.usage.todo}}`, { paddingLeft: ' ' }));
        console.log('');
    }

    process.exit(1);
}

exports.showBanner = () => {
    console.log(log.chalkish`{blue ${package.application.title} (${package.version})}`);
    console.log(log.chalkish`{blue Copyright ${package.application.copyright}}`);
    console.log('');
}

exports.showVersion = () => {
    this.showBanner();
    console.log(cliFormat.wrap(log.chalkish`{white ${package.application.summary}}`, { width: 80 }));
    console.log('');
    console.log(cliFormat.wrap(log.chalkish`{white ${package.application.license}}`, { width: 80 }), package.license);
    console.log('');
    process.exit(1);
}

exports.showLicense = () => {
    this.showBanner();
    let data = fs.readFileSync('./LICENSE');
    console.log(cliFormat.wrap(log.chalkish`{white ${data.toString()}}`, { width: 80 }));
    console.log('');
    process.exit(1);
}

exports.initialize = (command) => {
    try{
        if(!fs.existsSync(command.Options.Config)) {
            log.warn(`Config file '{blue ${command.Options.Config}}' not found. Creating config file with default properties.`);
            fs.writeFileSync(command.Options.Config, JSON.stringify(defaultConfig));
        }

        if(!isJSONFile(command.Options.Config)) {
            throw `Invalid config file '{yellow ${command.Options.Config}}'`;
        }
        
        let config = mergeJSON.merge(defaultConfig, require(command.Options.Config));

        config.TODO_FILE = path.resolve(process.cwd(), path.join(config.Path, 'todo.txt'));
        config.DONE_FILE = path.resolve(process.cwd(), path.join(config.Path, 'done.txt'));
        config.REPORT_FILE = path.resolve(process.cwd(), path.join(config.Path, 'report.txt'));

        // Override config file with flags paseed at commend line
        config.Verbose = (command.Options.Verbose ? true : config.Verbose);
        config.Confirm = (command.Options.Force ? false : config.Confirm);
        config.AutoArchive = (command.Options.AutoArchive ? true : config.AutoArchive);
        config.PreserveLineNumbers = (command.Options.PreserveLineNumbers ? true : config.PreserveLineNumbers);
        config.DateOnAdd = (command.Options.DateOnAdd ? true : config.DateOnAdd);
        config.PriorityOnAdd = (command.Options.PriorityOnAdd ? true : config.PriorityOnAdd);
        config.ShowHeaders = (command.Options.ShowHeaders ? true : config.ShowHeaders);
        config.HideContexts = (command.Options.HideContexts ? true : config.HideContexts);
        config.HideProjects = (command.Options.HideProjects ? true : config.HideProjects);
        config.HidePriorities = (command.Options.HidePriorities ? true : config.HidePriorities);
        config.NoColors = (command.Options.NoColors ? true : config.NoColors);

        return config;
    }
    catch(err) {
        throw log.chalkish`Error initializing application: {bold.red ${err}}`;
    }
}

exports.prompt = (options) => {
    if(!options.message) {
        throw `Required value '{blue Message}' is missing.`;
    }

    console.log(cliFormat.wrap(log.chalkish`   {bgWhite {black  ?}} {reset  ${options.message}}`, { width: 80, hangingIndent: '  ' }));

    let label = '', defaultLabel = '', defaultChoice = options.default, answers = [], defaultAnswer = '', helpStrings = [];
    
    let index = 0;
    options.choices.forEach(choice => {
        index++;
        let alias = choice.label.substring(choice.label.indexOf('&') + 1, 2);
        choice.label = choice.label.replace('&', '');

        if(index == defaultChoice) {
            label = label.concat(`{yellow [${alias}] ${choice.label} }`);
            defaultLabel = `(default is '${alias}')`;
            defaultAnswer = alias;
        } else {
            label = label.concat(`[${alias}] ${choice.label} `);
        }
        helpStrings.push(`[${choice.label}] ${choice.help} `);
        if(!options.CaseSensitive) {
            alias = alias.toLowerCase();
            choice.label = choice.label.toLowerCase();
            defaultAnswer = defaultAnswer.toLowerCase();
        }
        answers.push(alias);
        answers.push(choice.label);
    });

    if(!options.hideHelp) {
        label = label.concat('[?] Help ');
    }

    if(defaultLabel) {
        label = label.concat(defaultLabel);
    }

    label = label.trim();

    let answer = '';

    do {
        if(['?', 'Help'].includes(answer)) {
            helpStrings.forEach((item) => {
                console.log(cliFormat.wrap(log.chalkish`{gray ${item}}`, { width: 80, paddingLeft: '       ' }));
            });
        }
        answer = readline.question(cliFormat.wrap(log.chalkish`${label}: `, { width: 80, paddingLeft: '       ', paddingRight: ' ' }), (defaultAnswer ? { defaultInput: defaultAnswer} : {}));
        if(!options.CaseSensitive) {
            answer = answer.toLocaleLowerCase();
        }
    }while (!answers.includes(answer));
    
    console.log('');
    return answer;
}

exports.getFilenameUpper = function(filepath) {
    var filename = path.basename(filepath);
    return filename.substring(0, filename.lastIndexOf('.')).toUpperCase();
}

exports.cleanFile = (file) => {
    var contents = fs.readFileSync(file).toString();
    if(!contents.endsWith(os.EOL)) {
        fs.appendFileSync(file, os.EOL);
    }
}

const sortOptions = (a, b) => {
    return (a.option < b.option ) ? -1 : ((a.option > b.option) ? 1 : 0);
}

const isJSONFile = (filename) => {
    try {
        JSON.parse(fs.readFileSync(filename));
        return true;
    }
    catch {}
    return false;
}