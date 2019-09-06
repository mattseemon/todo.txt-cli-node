const path = require('path');
const fs = require('fs-extra');

const { strings } = require('./strings');

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

isJSONFile = (filename) => {
    try {
        JSON.parse(fs.readFileSync(filename));
        return true;
    }
    catch {}
    return false;
}

exports.parse = (args) => {
    processOption = (item) => {
        let opt = getOptionAlias(item);
        if(opt) {
            switch(opt.option) {
                case 'Config':
                    let configPath = args.shift();
                    if(!configPath) {
                        throw `Missing config file`;
                    }

                    let configPathAbsolute = path.resolve(process.cwd(), configPath);
                    if(!fs.existsSync(configPathAbsolute)) {
                        throw `Invalid config file path: '{blue ${configPath}}'`;
                    }

                    if(fs.lstatSync(configPathAbsolute).isDirectory()) {
                        configPath += (configPath.endsWith('\\') ? '' : '\\') + 'todo.config.json';
                    }

                    if(!isJSONFile(configPathAbsolute)) {
                        throw `Invalid config file '{blue ${configPath}}'`;
                    }
                    options[opt.option] = configPathAbsolute;
                    break;
                case 'SortBy':
                    let sortOption = args.shift();
                    if(opt.values.includes(sortOption)) {
                        options[opt.option] = sortOption;
                    } else {
                        throw `Invalid sort option: '{blue ${sortOption}}'`;
                    }
                    break;
                default:
                    options[opt.option] = true;
            }
        } else {
            throw `Invalid Option: '{blue ${item}}'`;
        }
    }

    let action = '', options = [], parameters = [];

    if(args.length > 0) {
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
                        throw `Invalid action: '{blue ${arg}}'`;
                    }
                }
                else {
                    parameters.push(arg);
                }
            }
            arg = args.shift();
        }
    } else {
        action = 'list';
    }

    return {
        "Action": action,
        "Options": options,
        "Arguments": parameters
    }
}