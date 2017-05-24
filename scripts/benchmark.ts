import * as fs from 'fs';

// tslint:disable:no-console

function walk(dir: string) {
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            walk(file);
        } else if (file.endsWith('.ts')) {
            console.log('');
            console.log(`Running ${file}`);
            const bench = file.substr(0, file.length - 3);
            require(`../${bench}`);
        }
    });
}

walk('./bench');
