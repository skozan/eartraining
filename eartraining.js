/*********************************************************************
 *
 * Ear Training
 * Copyright (c) 2017 Stefanos Kozanis <s.kozanis@gmail.com>
 *
 ********************************************************************/

var earTraining = (function () {
    var pub = {};
    var priv = {
        gotChallenge: false,
        successions: 2,
        progression: ['complete'],
        position: ['a'],
        voicing: ['6notes'],
        shots: [0],
        playLock: false,
        correct:0,
        wrong:0,
        targets: [0]};
    var KEYS = {
        0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F', 6: 'Gb',
        7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B'};
    var ORDER = {
        0: 'first',
        1: 'second',
        2: 'third',
        3: 'fourth',
        4: 'fifth',
        5: 'sixth',
        6: 'seventh',
        7: 'eighth',
        8: 'ninth',
        9: 'tenth',
        10: 'eleventh',
        11: 'twelvth'};

    var getRandomInt = function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    setRandomChallenge = function() {
        priv.progression = [];
        priv.position = [];
        priv.voicing = [];
        priv.targets = [];
        var progression = $('input[name="type"]:checked').val(),
            position = $('input[name="position"]:checked').val(),
            voicing = $('input[name="voicing"]:checked').val();
        var progressions = {0: 'complete', 1: 'unresolved'},
            positions = {0: 'a', 1: 'b'},
            voicings = {0: '6notes', 1: '3notes'};
        for(i=0; i<priv.successions; i++){
            var target = 1111; // an arbitrary big number to run the first iteration
            if (i==0)
                target = 0;
            // We need some random target, which should be one of
            // the selected by the user in the game rules, also
            // different from the previous target.
            while( (!$('form#keys #key-'+target).is(':checked')) ||
                    (i>0 && priv.targets[i-1]==target))
                target = getRandomInt(0, 11);
            priv.targets.push(target)
            priv.progression.push((progression != 'random') ?
                    progression:progressions[getRandomInt(0,1)])
            priv.position.push((position != 'random') ?
                    position:positions[getRandomInt(0,1)])
            priv.voicing.push((voicing != 'random') ?
                    voicing:voicings[getRandomInt(0,1)])
        }
    },
    getAudio = function(idx){
        var file=".audio"+"#"+priv.voicing[idx]+
            "-"+priv.position[idx]+
            "-"+priv.progression[idx]+
            "-"+priv.targets[idx];
        return $(file)[0];
    },
    playGameChallenge = function(idx){
        priv.playLock = true;
        var audio = getAudio(idx);
        audio.onended = function(){
            if (idx+1<priv.targets.length)
                 playGameChallenge(idx+1);
            else
            {
                priv.playLock = false;
                updateButtons();
            }
        };
        var playPromise = audio.play();
        if (playPromise !== undefined){
            playPromise.then(function(){
                // Do not have to do something here..
            }).catch(function(error){
                $('#advance-next').fadeIn('fast', function(){
                    $('form#form-advance-next input#btn-advance-next')
                    .one('click', function(){
                        audio.play();
                        $('#advance-next').fadeOut('fast');
                    });
                });
            });
        }
        updateButtons();
    },
    startNewGame = function(){
        // TODO: Require numeric input
        priv.successions = $('input#successions').val();
        if (! priv.successions){
            priv.successions = 2;
            $('input#successions').val(priv.successions);
        }
        // First is always C, so set zero as the first shot.
        priv.shots = [0];
        priv.playLock = false;
        setRandomChallenge();
        priv.gotChallenge = true;
        updateButtons();
        if(priv.successions>2)
            setMessage('Start entering your answer', '#000000');
        else
            setMessage('Enter your answer', '#000000');
    },
    getSuccessionVerbal = function(succession){
        var keys = succession.reduce(
                function(map, item){
                    map.push(KEYS[item]);
                    return map;
                }, []);
        return keys.join(" - ");
    },
    askForMoreShots = function(){
        setMessage('You just entered the '+
                ORDER[priv.shots.length-1]+
                ' progression, please enter the '+
                ORDER[priv.shots.length]+' progression ('+
                (priv.successions-priv.shots.length)+' more). '+
                'You answer so far: '+
                getSuccessionVerbal(priv.shots), '#000000');
        updateButtons();
    },
    checkAnswer = function(idx){
        priv.shots.push(idx);
        if (priv.shots.length<priv.targets.length)
            return askForMoreShots();
        priv.gotChallenge = false;
        updateButtons();
        var correctAnswer = getSuccessionVerbal(priv.targets);
        var userAnswer = getSuccessionVerbal(priv.shots);
        if (userAnswer == correctAnswer)
        {
            priv.correct++;
            setMessage('Your anwser: '+userAnswer+' is correct',
                    '#00ff00');
        }
        else
        {
            priv.wrong++;
            setMessage('Your answer: '+userAnswer+' is wrong, '+
                    'correct answer: '+correctAnswer, '#ff0000');
        }
        updateStats();
    },
    updateButtons = function(){
        $('form#answers input').prop('disabled', !priv.gotChallenge);
        $('form#answers input#submit-0').prop('disabled', !(
                    priv.gotChallenge && priv.successions>2 &&
                    priv.shots.length>1));
        $('form#form-play-controls input#play').prop('disabled',
                priv.gotChallenge);
        $('form#form-play-controls input#replay').prop('disabled',
                !priv.gotChallenge);
        $('form#keys input').prop('disabled', priv.gotChallenge);
        $('form#keys input#key-0').prop('disabled', true);
        $('form#type input').prop('disabled', priv.gotChallenge);
        $('form#form-successions input').prop('disabled',
                priv.gotChallenge);
        if (priv.playLock)
            $('form#form-play-controls input').prop('disabled', true);
    },
    setMessage = function(msg, color){
        $('span#message').text(msg);
        $('span#message').css('color', color);
    },
    updateStats = function(){
        $('span#correct').text(priv.correct);
        $('span#wrong').text(priv.wrong);
    };

    pub.initialize = function(){
        updateStats();
        updateButtons();
        setMessage('');
        $('form').submit(function(){
            return false;
        });
        $('form#form-play-controls input#play').click(function(){
            if ($('form#keys input:checked').length<3)
            {
                alert('At least two keys have to be chosen');
                return;
            }
            startNewGame();
            playGameChallenge(0);
        });
        $('form#form-play-controls input#replay').click(function(){
            playGameChallenge(0);
        });
        $('form#answers .answer').click(function(el){
            checkAnswer($(this).data('key'));
        });
    };
    return pub;
}());

earTraining.initialize();
