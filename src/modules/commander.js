const strings = require('../config/todo.strings');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs-extra');

getOptionAlias = (opt) => {
    return strings.usage.options.find(obj => {
        return ([obj.option, obj.alias]).includes(opt);
    });
}

getActionAlias = (act) => {
    let action = strings.usage.actions.find(obj => {
        return ([obj.action, obj.alias]).includes(act);
    });

    if(action) {
        return action.action;
    }
    return "";
}

exports.parse = (args) => {
    processOption = (item) => {
        let opt = getOptionAlias(item);
        if(opt) {
            switch(opt.option) {
                case 'Config':
                    let configPath = args.shift();
                    if(!configPath) {
                        throw chalk`Missing config file`;
                    }

                    if(fs.lstatSync(configPath).isDirectory()) {
                        configPath += "\\todo.config.json";
                    }

                    let configPathAbsolute = path.resolve(process.cwd(), configPath);
                    if(!fs.existsSync(configPathAbsolute)) {
                        throw chalk`Invalid config file path: '{blue ${configPath}}'`;
                    }
                    options[opt.option] = configPathAbsolute;
                    break;
                case 'SortBy':
                    let sortOption = args.shift();
                    if(opt.values.includes(sortOption)) {
                        options[opt.option] = sortOption;
                    } else {
                        throw chalk`Invalid sort option: '{blue ${sortOption}}'`;
                    }
                    break;
                default:
                    options[opt.option] = true;
            }
        } else {
            throw chalk`Invalid Option: '{blue ${item}}'`;
        }
    }

    let action = '', options = [], parameters = [];

    let arg = args.shift();
    while(arg) {
        if(arg.startsWith('--')) {
            processOption(arg.replace('--', ''));
        } else if (arg.startsWith('-')) {
            let opts = arg.split('');
            opts.shift();
            opts.forEach(item => {
                return processOption(item);
            });
        } else {
            if(!action) {
                action = getActionAlias(arg);
                if(!action) {
                    throw chalk`Invalid action: '{blue ${action}}'`;
                }
            }
            else {
                parameters.push(arg);
            }
        }
        arg = args.shift();
    }

    return {
        "Action": action,
        "Options": options,
        "Arguments": parameters
    }
}