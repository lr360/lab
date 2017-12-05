'use strict';

// Load modules

const Fs = require('fs');
const Path = require('path');
const Handlebars = require('handlebars');
const _ = require('lodash');


// Declare internals

const internals = {};


exports = module.exports = internals.Reporter = function (options) {

    this.settings = options;

    const filename = Path.join(__dirname, 'sonarqube', 'report.xml');
    const template = Fs.readFileSync(filename, 'utf8');
    this.view = Handlebars.compile(template);

};


internals.Reporter.prototype.start = function (notebook) {

};


internals.Reporter.prototype.test = function (test) {
};


internals.Reporter.prototype.end = function (notebook) {

    const context = {
        count: notebook.tests.length,
        failures: notebook.failures,
        errors: notebook.errors.length,
        skipped: 0,
        time: notebook.ms
    };


    const groups = _.groupBy(notebook.tests, (test) => {

        return test.filename;
    });

    context.groups = [];

    _.forEach(groups, (tests, filename) => {

        const groupTests = [];

        _.forEach(tests, (nbtest) => {

            const test = {
                title: nbtest.title,
                path: nbtest.path.join(' '),
                relativeTitle: nbtest.relativeTitle,
                time: nbtest.duration
            };

            if (nbtest.skipped || nbtest.todo) {
                test.skipped = true;
                ++context.skipped;
            }

            if (nbtest.err) {
                test.err = {
                    name: nbtest.err.name,
                    message: nbtest.err.message,
                    details: nbtest.err.stack
                };
            }

            groupTests.push(test);
        });

        context.groups.push({ filename, tests: groupTests });

    });

    this.report(this.view(context));
};
