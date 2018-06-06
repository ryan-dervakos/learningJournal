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
        actorName = "rDev";
    }
    return actorName;
}

function getActorEmail() {
    var actorEmail;
    if (typeof tincan !== "undefined" && tincan.actor !== null) {
        actorEmail = tincan.actor.mbox;
    }
    else {
        actorEmail = "mailto:ryan@efrontlearning.com";
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
    var today = new Date();
    signalStatement(initStatement);
    var vm = new Vue({
            el: '#contentPanel',
            data: {
                name: actorName,
                selectedModule: [],
                date: today.toLocaleDateString(),
                message: "",
                reflections: [],
                modules: [
                    { text: 'Build a collaborative team', value: 'bact' },
                    { text: 'Let people know you care', value: 'lpkyc' },
                    { text: 'Help your people to succeed', value: 'hypts' },
                    { text: 'Do the right thing', value: 'dtrt' },
                ],
                selectedTopic: []
            },
        mounted: function () {
            returnAllReflectionsPromise().then(function (value) {
                vm.reflections = parseTincanJson(value);
                console.log(vm.reflections);
            });
            },
            computed: {
                reflections: function () {
                    returnAllReflectionsPromise().then(function (value) {
                        console.log(value);
                        return value;
                    });
                    console.log(this);
                },
                topics: function () {
                    if (this.selectedModule == "bact") {
                        var options = [
                            { text: "Story Time: The Sound of the Forest", value: "1" },
                            { text: "How to Build a Happy & Engaged Team", value: "2" },
                            { text: "Know Me: Team Assessment", value: "3" },
                            { text: "How to Recognise Team Dysfunctions", value: "4" },
                            { text: "How to Deal with Team Dysfunctions", value: "5" },
                            { text: "Know Me: So, Am I Trustworthy?", value: "6" },
                            { text: "Lessons from the SAS", value: "7" },
                            { text: "How to Manage Conflict in the Team", value: "8" },
                            { text: "Know Me: So, Do I Need a team", value: "9" },
                            { text: "Stages of Team Development", value: "10" },
                            { text: "Quiz: On Team Development", value: "11" },
                            { text: "Lessons from the Rolling Stones", value: "12" },
                            { text: "Teamwork by Design", value: "13" },
                            { text: "Too much, too little, too late", value: "14" },
                            { text: "Groupthink", value: "15" },
                            { text: "Quiz: Team Roles", value: "16" },
                            { text: "How to Make Virtual Teams Work", value: "17" },
                            { text: "On Being a Good Team Leader", value: "18" },
                            { text: "How Would You Deal With This Situation", value: "19" },
                            { text: "Story Time: Is there a Mouse in Your Team?", value: "20" },

                        ];
                    }
                    else if (this.selectedModule == "lpkyc") {
                        var options = [{ text: "Test Course", value: "111" },
                            { text: "Test Course2123", value: "222" },
                            { text: "Test Course332", value: "342" },
                            { text: "Test Course4123", value: "344" },
                            { text: "Test Course5123", value: "555" },
                            { text: "Test Course6123", value: "653" },
                            { text: "Test Course73", value: "751" },];
                    }
                    return options

                }
            },
            methods: {
                submit: function (event) {
                    console.log(this.message);
                    buildAndSendReflectionStatement(this.selectedModule, this.selectedTopic, this.message);
                    returnAllReflectionsPromise().then(function (value) {
                        vm.reflections = parseTincanJson(value);
                    });

                },
                getandsetreflection: function () {
                    returnRefPromise(this.selectedModule, this.selectedTopic).then(function (value) {
                        vm.message = value;
                    });
                }

            }

        }
    );

    function parseTincanJson(obj) {
        var reflection = [];
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].context.extensions["http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/module"] !== undefined) {
                reflection[i] = {
                    id: obj[i].id,
                    date: obj[i].timestamp.substr(0, obj[i].timestamp.indexOf('T')),
                    module: getModuleFromShortCode(obj[i].context.extensions["http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/module"]),
                    topic: getTopicById(obj[i].context.extensions["http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/topic"]),
                    reflection: obj[i].context.extensions["http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/userInput"],
                };
            }
        }
        return reflection;
    }

    function getModuleFromShortCode(code) {
        var modules = {
            "bact": "Build a collaborative team",
            "lpkyc": "Let people know you care",
            "hypts": "Help your people to succeed",
            "dtrt": "Do the right thing"
        }

        return modules[code];
    }

    function getTopicById(id) {
        var topics = {
            "1": "Story Time: The Sound of the Forest",
            "2": "How to Build a Happy & Engaged Team",
            "3": "Know Me: Team Assessment",
            "4": "How to Recognise Team Dysfunctions",
            "5": "How to Deal with Team Dysfunctions",
            "6": "Know Me: So, Am I Trustworthy?",
            "7": "Lessons from the SAS",
            "8": "How to Manage Conflict in the Team",
            "9": "Know Me: So, Do I Need a team",
            "10": "Stages of Team Development",
            "11": "Quiz: On Team Development",
            "12": "Lessons from the Rolling Stones",
            "13": "Teamwork by Design",
            "14": "Too much, too little, too late",
            "15": "Groupthink",
            "16": "Quiz: Team Roles",
            "17": "How to Make Virtual Teams Work",
            "18": "On Being a Good Team Leader",
            "19": "How Would You Deal With This Situation",
            "20": "Story Time: Is there a Mouse in Your Team?",
        };
        return topics[id];
    }

    function returnAllReflectionsPromise(module, topic) {
        return new Promise(function (resolve, reject) {
            lrs.queryStatements(
                {
                    params: {
                        verb: new TinCan.Verb(
                            {
                                id: "http://adlnet.gov/expapi/verbs/reflected/"
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
                        )
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
                            resolve(sr.statements);
                            // text = sr.statements[0].context.extensions[ROOT_ACTIVITY_ID+"/userInput"];
                        }
                        // TODO: do something with statements in sr.statements
                    }
                }
            );

        });
    }

    function returnRefPromise(module, topic) {
        return new Promise(function (resolve, reject) {
            var text = "";
            lrs.queryStatements(
                {
                    params: {
                        verb: new TinCan.Verb(
                            {
                                id: "http://adlnet.gov/expapi/verbs/reflectedonmodule/" + module + "/" + topic
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
                            text = "";
                            resolve(text);
                        }
                        // TODO: do something with statements in sr.statements
                    }
                }
            );

        });
    }

    function buildAndSendReflectionStatement(module, topic, message) {
        var refStatement = new TinCan.Statement({
            actor: {
                name: actorName,
                mbox: actorEmail
            },
            verb: {
                id: "http://adlnet.gov/expapi/verbs/reflectedonmodule/" + module + "/" + topic,
                display: {
                    "en-US": "reflectedOnModule" + module + "-" + topic
                }
            },
            object: {
                id: ROOT_ACTIVITY_ID
            },
            context: {
                extensions: {
                    "http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/userInput": message,
                },
            }
        });
        var genRefStatement = new TinCan.Statement({
            actor: {
                name: actorName,
                mbox: actorEmail
            },
            verb: {
                id: "http://adlnet.gov/expapi/verbs/reflected/",
                display: {
                    "en-US": "reflected"
                }
            },
            object: {
                id: ROOT_ACTIVITY_ID
            },
            context: {
                extensions: {
                    "http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/userInput": message,
                    "http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/module": module,
                    "http://www.taolin.co.uk/program/ilead/course/generic/learning-object/generic/topic": topic,
                },
            }
        });
        signalStatement(refStatement);
        signalStatement(genRefStatement);
    }

};