const nGram = require('n-gram');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const randomNormal = require('random-normal');
const express = require('express');
const languageName = require('./resources/language-name').language_dictionary;
const SHORT_TEXT_THRESHOLD = 50;
const CONV_THRESHOLD = 0.99999;
const ALPHA = 0.5;
const ALPHA_WIDTH = 0.05;
const ITERATION_LIMIT = 1000;
const N_TRIAL = 7;
const BASE_FREQ = 10000;
const gramLengths = [1, 2, 3];
const wordLangProbMap = {};
const langProfiles = {};
const langList = [];

const app = express();
const PORT = 3000;

// create a route for the app
app.get('/getLanguagesCount', (req, res) => {
    res.send(langList.length.toString());
});

app.get('/detectLanguage', (req, res) => {
    const text = req.query["value"];
    res.send(detectLangauge(text));
});

app.use(express.static('public'));

function getProbabilities(text) {
    return detectBlock(text);
}

function initProbability() {
    const result = new Array(langList.length);
    result.fill(1.0 / langList.length, 0, langList.length);
    return result;
}

function normalizeProb(prob) {
    let maxp = 0;
    let sump = 0;
    for(let i=0;i<prob.length;++i) sump += prob[i];
    for(let i=0;i<prob.length;++i) {
        const p = (prob[i] * 1.0) / (sump * 1.0);
        if (maxp < p) {
            maxp = p;
        }
        prob[i] = p;
    }
    return maxp;
}

function updateLangProb(prob, ngram, count, alpha) {
    const prefixFactor = 1.0;
    const suffixFactor = 1.0;
    langProbMap = wordLangProbMap[ngram];

    if (!langProbMap) {
        return;
    }

    const weight = alpha / BASE_FREQ;
    if (ngram.length > 1) {
        if (prefixFactor != 1.0 && ngram[0] === ' ') {
            weight *= prefixFactor;
        } else if (suffixFactor != 1.0 && ngram[ngram.length - 1] === ' ') {
            weight *= suffixFactor;
        }
    }

    for (i in prob) {
        for (let amount=0; amount<count; amount++) {
            prob[i] *= (weight + (langProbMap[i] || 0));
        }
    }    
}

function detectBlockShortText(ngrams) {
    const prob = initProbability();
    for (ngram of Object.keys(ngrams)) {
        updateLangProb(prob, ngram, ngrams[ngram], ALPHA);
        if (normalizeProb(prob) > CONV_THRESHOLD) {
            break; //this break ensures that we quit the loop before all probabilities reach 0        
        }
    };
    normalizeProb(prob);
    return prob;
}

function detectBlockLongText(ngrams) {
    const langprob = new Array(langList.length);
    langprob.fill(0, 0, langProfiles.length);
    for (let t = 0; t < N_TRIAL; ++t) {
        const prob = initProbability();
        const alpha = ALPHA + (randomNormal() * ALPHA_WIDTH);

        for (let i=0; i<ITERATION_LIMIT; i++) {
            const r = Math.round(Math.random() * ngrams.length);
            updateLangProb(prob, ngrams[r], 1, alpha);
            if (i % 5 == 0) {
                if (normalizeProb(prob) > CONV_THRESHOLD) {
                    break; //this break ensures that we quit the loop before all probabilities reach 0
                }
            }
        }
        for (let j = 0; j < langprob.length; ++j) {
            langprob[j] += prob[j] * 1.0 / N_TRIAL;
        }
    }
    return langprob;
}

function detectBlock(text) {
    if (text.length < SHORT_TEXT_THRESHOLD) {
        const ngrams = extractCountedGrams(text);
        return detectBlockShortText(ngrams);
    } else {
        const strings = extractGrams(text);
        return detectBlockLongText(strings);
    }
}

function extractGrams(text) {
    let result = [];
    for (length of gramLengths) {
        result = result.concat(nGram(length)(text));
    }
    return result;
}

function extractCountedGrams(text) {
    const result = {};
    for (gramLength of gramLengths) {
        const ngrams = nGram(gramLength)(text);
        for (gram of ngrams) {
            if (gram in result) {
                result[gram]++
            } else {
                result[gram] = 1;
            }
        }
    }
    return result;
}

function buildProfile(content) {
    profile = JSON.parse(content);
    let newProfile = {
        locale: profile.name,
        minimalFrequency: 1,
        ngrams: {
            1: {},
            2: {},
            3: {}
        },
        stats: {
            numOccurrences: {
                1: profile.n_words[0],
                2: profile.n_words[1],
                3: profile.n_words[2]
            },
            minGramCounts: {},
            maxGramCounts: {}    
        }
    };

    Object.keys(profile.freq).forEach((key) => {
        newProfile.ngrams[key.length][key] = profile.freq[key];
    });

    gramLengths.forEach((freq) => {
        let min = Number.MAX_SAFE_INTEGER;
        let max = 0;
        Object.keys(newProfile.ngrams[freq]).forEach((key) => {
            const value = newProfile.ngrams[freq][key];
            if (min > value) {
                min = value;
            }
            if (max < value) {
                max = value;
            }
        });
        newProfile.stats.minGramCounts[freq] = min;
        newProfile.stats.maxGramCounts[freq] = max;
    });

    langProfiles[newProfile.locale] = newProfile;

    return Promise.resolve();
}

const dirname = __dirname + "/resources/languages/";

fs.readdirAsync(dirname)
.then((filenames) => {
    const promises = [];
    return Promise.map(filenames, (filename) => {
        return fs.readFileAsync(dirname + filename, 'utf-8')
        .then((content) => {
            return buildProfile(content);
        })
    })
    .then(() => {
        // Finished reading all files
        index = -1;
        Object.keys(langProfiles).forEach((lang) => {
            index++;
            langList.push(lang);

            for (gramLength of gramLengths) {
                Object.keys(langProfiles[lang].ngrams[gramLength]).forEach((ngram) => {
                    if (!(ngram in wordLangProbMap)) {
                        wordLangProbMap[ngram] = {};
                    }
                    const frequency = langProfiles[lang].ngrams[gramLength][ngram] || 0;
                    const prob = frequency * 1.0 / langProfiles[lang].stats.numOccurrences[gramLength];
                    wordLangProbMap[ngram][index] = prob;
                });
            }
        });
    })
})
.then(() => {
    console.log("\nRunning some tests:");
    check("Dies ist eine deutsche Text", "de");
    check("The bus started driving", "en");
    check("הילד הלך לבית הספר", "he");
    check("Just when i thought i was out, they pulled me back in!", "en"); // Checking a string with length higher than 'SHORT_TEXT_THRESHOLD'
    console.log("Done\n");
})
.then(() => {
    app.listen(PORT, () => {
        console.log(`Server running at: http://localhost:${PORT}/`);
    });    
});

function detectLangauge(testString) {
    const probabilities = getProbabilities(testString);
    const index = probabilities.indexOf(Math.max(...probabilities));
    
    return {
        language: langList[index],
        language_name: languageName.filter(x => Object.keys(x) == langList[index])[0][langList[index]],
        prob: probabilities[index]
    };
}

function check(testString, expectedLanguage) {
    const detectedLanguage = detectLangauge(testString).language;
    if (detectedLanguage == expectedLanguage) {
        console.log("SUCCESS! " + testString + " was identified successfully as " + expectedLanguage);
    } else {
        console.log("FAILURE! " + testString + " failed to identify. Should be " + expectedLanguage + ", identified as " + detectedLanguage);
    }
}