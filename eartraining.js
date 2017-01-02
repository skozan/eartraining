var EarTraining = (function () {
    var pub = {};
    var priv = {
        got_challenge: false,
        successions: 2,
        cadence: ['complete'],
        shots: [0],
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

    var get_random_int = function(min, max){
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    set_random_challenge = function() {
        priv.cadence = [];
        priv.targets = [];
        var cadence = $('input[name="type"]:checked').val();
        var cadences = {0: 'complete', 1: 'unresolved'};
        for(i=0; i<priv.successions; i++){
            var target = 1111; // an arbitrary big number to run the first iteration
            if (i==0)
                target = 0;
            // We need some random target, which should be one of
            // the selected by the user in the game rules, also
            // different from the previous target.
            while( (!$('form#keys #key-'+target).is(':checked')) ||
                    (i>0 && priv.targets[i-1]==target))
            {
                target = get_random_int(0, 11);
            }
            priv.targets.push(target)
            if(cadence != 'random'){
                priv.cadence.push(cadence);
            }
            else
            {
                priv.cadence.push(cadences[get_random_int(0,1)]);
            }
        }
    },
    get_audio = function(idx){
        var file=".audio"+"#"+priv.cadence[idx]+"-"+priv.targets[idx];
        return $(file)[0];
    },
    play_game_challenge = function(idx){
        var primary_aud = get_audio(0);
        primary_aud.onended = function(){
            get_audio(1).play();
        };
        primary_aud.play();
    },
    start_new_game = function(){
        // TODO: Require numeric input
        console.log($('input#successions').val());
        // First is always C, so set zero as the first shot.
        priv.shots = [0];
        set_random_challenge();
        priv.got_challenge = true;
        update_buttons();
        if(priv.successions>2)
            set_message('Start entering your answer', '#000000');
        else
            set_message('Enter your answer', '#000000');
    },
    get_game_result = function(){
        var result = {success: true, targets: []};
        for(i=0;i<priv.targets.length;i++){
            if (targets[i]!=shots[i])
                result.sucess = false;
            result.targets[i] = priv.targets[i]
        }
        return result;
    },
    get_succession_verbal = function(succession){
        var keys = succession.reduce(
                function(map, item){
                    map.push(KEYS[item]);
                    return map;
                }, []);
        return keys.join(" - ");
    },
    need_more_shots = function(){
        set_message('You just entered the '+
                ORDER[priv.shots.length-1]+' cadence, please enter the '+
                ORDER[priv.shots.length]+' cadence ('+
                (priv.successions-priv.shots.length)+' more). '+
                'You answer so far: '+
                get_succession_verbal(priv.shots), '#000000');
        update_buttons();
    },
    check_answer = function(idx){
        priv.shots.push(idx);
        if (priv.shots.length<priv.targets.length)
            return need_more_shots();
        priv.got_challenge = false;
        update_buttons();
        var correct_answer = get_succession_verbal(priv.targets);
        var user_answer = get_succession_verbal(priv.shots);
        if (user_answer == correct_answer)
        {
            priv.correct++;
            set_message('Your anwser: '+user_answer+' is correct',
                    '#00ff00');
        }
        else
        {
            priv.wrong++;
            set_message('Your answer: '+user_answer+' is wrong, '+
                    'correct answer: '+correct_answer, '#ff0000');
        }
        update_stats();
    },
    update_buttons = function(){
        $('form#answers input').prop('disabled', !priv.got_challenge);
        $('form#answers input#submit-0').prop('disabled', !(
                    priv.got_challenge && priv.successions>2 &&
                    priv.shots.length>1));
        $('form#play input#play').prop('disabled', priv.got_challenge);
        $('form#play input#replay').prop('disabled', !priv.got_challenge);
        $('form#keys input').prop('disabled', priv.got_challenge);
        $('form#keys input#key-0').prop('disabled', true);
        $('form#type input').prop('disabled', priv.got_challenge);
        $('form#successions input').prop('disabled', priv.got_challenge);
    },
    set_message = function(msg, color){
        $('span#message').text(msg);
        $('span#message').css('color', color);
    },
    update_stats = function(){
        $('span#correct').text(priv.correct);
        $('span#wrong').text(priv.wrong);
    };

    pub.initialize = function(){
        update_stats();
        update_buttons();
        set_message('');
        $('form').submit(function(){
            return false;
        });
        $('form#play input#play').click(function(){
            if ($('form#keys input:checked').length<2)
            {
                alert('At least two keys have to be chosen');
                return;
            }
            start_new_game();
            play_game_challenge();
        });
        $('form#play input#replay').click(function(){
            play_game_challenge();
        });
        $('form#answers .answer').click(function(el){
            check_answer($(this).data('key'));
        });
    };
    return pub;
}());

EarTraining.initialize();
