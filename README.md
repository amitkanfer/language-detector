# language-detector
This is a simple demo for language detection mechanism using NLP techniques.

### An overview of the function of the code (i.e., what it does and what it can be used for). 
The <b>language-detector</b> application detects the language of the text that is entered in the 
<i>Input Text</i> area. As you type the letters, the app in the background, runs an algorithm to detect the probabilities of
the string/text typed. Based on the best probability achieved, it concludes the language in the format <i>"locale - language name"</i>, for e.g. "en - English". It also displays the percentage of probability for the detected text.

The idea behind this application was based on personal experience of one of our Author Amit Kanfer. Amit's native language being Hebrew, he mostly set his keyboard on Hebrew in order to write emails to friends/family. And many a times, when he is writing his office emails, halfway through he is on Hebrew and realizes that he should have being warned and changed his keyboard language.
So, this is one of the use case for our application.
Along with the above, this application can be integrated with some of the below existing tools/application for language detection:
    
    a. Text editor
    b. Email composing editor
    c. Chat applications

### Documentation of how the software is implemented with sufficient detail so that others can have a basic understanding of your code for future extension or any further improvement
This application is build using Node Js and various NPM packages like n-gram, bluebird, etc.

Application is maintaining a resource for each of the supported language. Here it is supporting 71 languages. Refer to path `resources/languages`. For each language, this resource is basically the frequency of each letter in that language.

At run time, the application builds a profile for the languages based on the resource file available. To do this, it creates N-grams from the texts. This is stored in the profiles.
We are using NPM package `n-gram` to generate the N-grams. The support is for unigram, bigram and trigram.

When the user inputs the text, we go in exactly the same process. Based on the input text, create n-grams for it. And compare the relative frequency of them and find the language that matches the best frequency.

### Documentation of the usage of the software including either documentation of usages of APIs or detailed instructions on how to install and run a software, whichever is applicable.

Follow the below steps to run the application demo

1. clone the repo using https://github.com/amitkanfer/language-detector.git or by clicking on the Clone or download button and copying the GIT link.
2. run `npm install`
3. run `node main.js`
    Be sure to check if this throws error for PORT already in use.
    If you get an error for this, open `main.js` and look for line `const PORT = 80;`
    Change the port number to a desired one.
4. Change PORT number in PORT URL here and browse to `http://localhost:PORT/` using your favorite web  browser.

### Brief description of contribution of each team member in case of a multi-person team. 
Amit Kanfer worked on the algorithm in node and created the git repo to package this application
Punam Mahale worked on language name integration, UI styling and the documentation.

### Challenges/Limitation
If the input text is short(less than 50 characters) or is unclean such as tweets, the application may give varying locale as the probability is calculated.

The input text if composed of various languages, the application detects the language that is the most dominant. The algorithm may detect wrong language. However, the suggestion is to split the text in paragrams or sentences and detect in parts. 

Since, this application is supporting only 71 languages right now whose profiles gets build at runtime, if a language is not supported, the application may give unexpected results. One of the improvements to this application can be this scenario to warn that language is not supported.

## Language Supported by our application

1. af Afrikaans
1. an Aragonese
1. ar Arabic
1. ast Asturian
1. be Belarusian
1. br Breton
1. ca Catalan
1. bg Bulgarian
1. bn Bengali
1. cs Czech
1. cy Welsh
1. da Danish
1. de German
1. el Greek
1. en English
1. es Spanish
1. et Estonian
1. eu Basque
1. fa Persian
1. fi Finnish
1. fr French
1. ga Irish
1. gl Galician
1. gu Gujarati
1. he Hebrew
1. hi Hindi
1. hr Croatian
1. ht Haitian
1. hu Hungarian
1. id Indonesian
1. is Icelandic
1. it Italian
1. ja Japanese
1. km Khmer
1. kn Kannada
1. ko Korean
1. lt Lithuanian
1. lv Latvian
1. mk Macedonian
1. ml Malayalam
1. mr Marathi
1. ms Malay
1. mt Maltese
1. ne Nepali
1. nl Dutch
1. no Norwegian
1. oc Occitan
1. pa Punjabi
1. pl Polish
1. pt Portuguese
1. ro Romanian
1. ru Russian
1. sk Slovak
1. sl Slovene
1. so Somali
1. sq Albanian
1. sr Serbian
1. sv Swedish
1. sw Swahili
1. ta Tamil
1. te Telugu
1. th Thai
1. tl Tagalog
1. tr Turkish
1. uk Ukrainian
1. ur Urdu
1. vi Vietnamese
1. wa Walloon
1. yi Yiddish
1. zh-cn Simplified Chinese
1. zh-tw Traditional Chinese

## Authors
Amit Kanfer and Punam Mahale

## References
https://www.npmjs.com/package/n-gram
https://www.npmjs.com/package/bluebird
http://bluebirdjs.com/docs/api-reference.html
https://www.npmjs.com/package/random-normal
https://www.npmjs.com/package/express
https://github.com/optimaize/language-detector
https://blog.xrds.acm.org/2017/10/introduction-n-grams-need/
https://en.wikipedia.org/wiki/Frequency_analysis