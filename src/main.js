var ROOT_ACTIVITY_ID = "http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic";

var tincan = new TinCan(
    {
        url: window.location.href,
        activity: {
            id: ROOT_ACTIVITY_ID
        }
    }
);

var lrs = getLrs();
var actorEmail = getActorEmail();
var actorName = getActorName();
var actorObj = getActorObj();

function getLrs() {
    var returnme;
    try {
        returnme = new TinCan.LRS(
            {
                endpoint: "https://cloud.scorm.com/tc/JYFUW991B4/",
                username: "chgm3Ilb9S33LDPYkDg",
                password: "5Xuy9z0SHCOkmTCG4r8",
                allowFail: false
            }
        );
    }
    catch (ex) {
        console.log("Failed to setup LRS object: " + ex);
        returnme = ex;
        return returnme;
        // TODO: do something with error, can't communicate with LRS
    }

    return returnme;
}

function getActorObj() {
    if (typeof tincan !== "undefined" && tincan.actor !== null) {
        return tincan.actor;
    }
}

function getActorName() {
    var actorName;
    if (typeof tincan !== "undefined" && tincan.actor !== null) {
        actorName = tincan.actor.name;
    }
    else {
        actorName = "Ryan Developer";
    }
    return actorName;
}

function getActorEmail() {
    var actorEmail;
    if (typeof tincan !== "undefined" && tincan.actor !== null) {
        actorEmail = tincan.actor.mbox;
    }
    else {
        actorEmail = "mailto:ryandi@theartoflearn.com";
    }
    return actorEmail;
}

function signalStatement(statement) {
    tincan.sendStatement(statement, function () {
        console.log("statement TC");
    });

    lrs.saveStatement(
        statement,
        {
            callback: function (err, xhr) {
                if (err !== null) {
                    console.log(err);
                    if (xhr !== null) {
                        console.log("Failed to save statement: " + xhr.responseText + " (" + xhr.status + ")");
                        // TODO: do something with error, didn't save statement
                        return;
                    }

                    console.log("Failed to save statement: " + err);
                    // TODO: do something with error, didn't save statement
                    return;
                }

                console.log("Statement saved");
                // TOOO: do something with success (possibly ignore)
            }
        }
    );
}

var initStatement = new TinCan.Statement({
    actor: {
        name: actorName,
        mbox: actorEmail
    },
    verb: {
        id: "http://adlnet.gov/expapi/verbs/initialized",
        display: {
            "en-US": "initialized"
        }
    },
    object: {
        id: ROOT_ACTIVITY_ID
    },
});


window.onload = function () {

    signalStatement(initStatement);
    Vue.component('sub-component', {
        template: '<div>{{ message }}</div>',
        props: [ 'message' ],
        methods: getandsetreflection = function () {
            this.$emit('refreshMessage');
        }
    });
    var vm = new Vue({
            el: '#contentPanel',
            data: {
                name: actorName,
                selectedModule: [],
                message: "",
                modules: [
                    { text: 'Build a collaborative team', value: 'm1' },
                    { text: 'Let people know you care', value: 'm2' },
                    { text: 'Help your people to succeed', value: 'm3' },
                    { text: 'Do the right thing', value: 'm4' },
                ],
                selectedTopic: [],
            },
            computed: {
                topics: function () {
                    if (this.selectedModule == "m1") {
                        var options = [
                            { text: "Test Course", value: "1" },
                            { text: "Test Course2", value: "2" },
                            { text: "Test Course3", value: "3" },
                            { text: "Test Course4", value: "4" },
                            { text: "Test Course5", value: "5" },
                            { text: "Test Course6", value: "6" },
                            { text: "Test Course7", value: "7" },
                        ];
                    }
                    else if (this.selectedModule == "m2") {
                        var options = [{ text: "Test Course", value: "1" },
                            { text: "Test Course2123", value: "22" },
                            { text: "Test Course332", value: "32" },
                            { text: "Test Course4123", value: "44" },
                            { text: "Test Course5123", value: "55" },
                            { text: "Test Course6123", value: "63" },
                            { text: "Test Course73", value: "71" },];
                    }
                    return options

                }
            },
            methods: {
                submit: function (event) {
                    console.log(this.message);
                    buildAndSendReflectionStatement(this.selectedModule, this.selectedTopic, this.message);

                },
                getandsetreflection: function () {
                    returnRefPromise(this.selectedModule, this.selectedTopic).then(function (value) {
                        vm.message = value;
                    });
                }

            }

        }
    );


function returnRefPromise(module, topic) {
    return new Promise(function (resolve, reject) {
        var text = "";
        lrs.queryStatements(
            {
                params: {
                    verb: new TinCan.Verb(
                        {
                            id: "http://adlnet.gov/expapi/verbs/reflected/" + module + "/" + topic
                        }
                    ),
                    agent: new TinCan.Agent(
                        {
                            mbox: actorEmail
                        }
                    ),
                    activity: new TinCan.Activity(
                        {
                            id: ROOT_ACTIVITY_ID
                        }
                    ),
                    limit: 1
                },
                callback: function (err, sr) {
                    if (err !== null) {
                        console.log("Failed to query statements: " + err);
                        // TODO: do something with error, didn't get statements
                        return;
                    }

                    if (sr.more !== null) {
                        // TODO: additional page(s) of statements should be fetched
                    }

                    if (sr.statements.length != 0) {
                        text = sr.statements[0].context.extensions[ROOT_ACTIVITY_ID + "/userInput"];
                        resolve(text);
                        // text = sr.statements[0].context.extensions[ROOT_ACTIVITY_ID+"/userInput"];
                    }
                    else{
                        text = "";
                        resolve(text);
                    }
                    // TODO: do something with statements in sr.statements
                }
            }
        );

    });
}

    var retrieveLearnerReflectionPromise = new Promise(function (resolve, reject) {
        var module = "m1";
        var topic = "2";
        var text = "";
        lrs.queryStatements(
            {
                params: {
                    verb: new TinCan.Verb(
                        {
                            id: "http://adlnet.gov/expapi/verbs/reflected/" + module + "/" + topic
                        }
                    ),
                    agent: new TinCan.Agent(
                        {
                            mbox: actorEmail
                        }
                    ),
                    activity: new TinCan.Activity(
                        {
                            id: ROOT_ACTIVITY_ID
                        }
                    ),
                    limit: 1
                },
                callback: function (err, sr) {
                    if (err !== null) {
                        console.log("Failed to query statements: " + err);
                        // TODO: do something with error, didn't get statements
                        return;
                    }

                    if (sr.more !== null) {
                        // TODO: additional page(s) of statements should be fetched
                    }

                    if (sr.statements.length != 0) {
                        text = sr.statements[0].context.extensions[ROOT_ACTIVITY_ID + "/userInput"];
                        resolve(text);
                        // text = sr.statements[0].context.extensions[ROOT_ACTIVITY_ID+"/userInput"];
                    }
                    else {
                        reject("A reason");
                        // console.log('thjing');
                    }
                    // TODO: do something with statements in sr.statements
                }
            }
        );

    });

    function buildAndSendReflectionStatement(module, topic, message) {
        console.log(message);
        var refStatement = new TinCan.Statement({
            actor: {
                name: actorName,
                mbox: actorEmail
            },
            verb: {
                id: "http://adlnet.gov/expapi/verbs/reflected/" + module + "/" + topic,
                display: {
                    "en-US": "reflected"
                }
            },
            object: {
                id: ROOT_ACTIVITY_ID
            },
            context: {
                extensions: {
                    "http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/userInput": message
                }
            }
        });
        signalStatement(refStatement);
    }

    function retrieveLearnerReflection(module, topic) {
        var text = "nothing" + Math.random();
        lrs.queryStatements(
            {
                params: {
                    verb: new TinCan.Verb(
                        {
                            id: "http://adlnet.gov/expapi/verbs/reflected/" + module + "/" + topic
                        }
                    ),
                    agent: new TinCan.Agent(
                        {
                            mbox: actorEmail
                        }
                    ),
                    activity: new TinCan.Activity(
                        {
                            id: ROOT_ACTIVITY_ID
                        }
                    ),
                    limit: 1
                },
                callback: function (err, sr) {
                    if (err !== null) {
                        console.log("Failed to query statements: " + err);
                        // TODO: do something with error, didn't get statements
                        return;
                    }

                    if (sr.more !== null) {
                        // TODO: additional page(s) of statements should be fetched
                    }

                    if (sr.statements.length != 0) {
                        return sr.statements[0].context.extensions[ROOT_ACTIVITY_ID + "/userInput"];
                        // text = sr.statements[0].context.extensions[ROOT_ACTIVITY_ID+"/userInput"];
                    }
                    else {
                        // console.log('thjing');
                    }
                    // TODO: do something with statements in sr.statements
                }
            }
        );
        return text;
    }
};