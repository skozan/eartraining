var EarTraining = (function () {
    var pub = {};
    var priv = {
        got_challenge: false,
        cadence: 'complete',
        correct:0,
        wrong:0,
        position: -1};

    var set_random_challenge = function() {
        priv.cadence = $('input[name="type"]:checked').val();
        priv.position = Math.floor(Math.random() * 12) + 1;
        if (! $('form#keys #key-'+priv.position).is(':checked') )
            set_random_challenge();
    },
    get_audio = function(idx){
        var file=".audio"+"#"+priv.cadence+"-"+idx;
        return $(file)[0];
    },
    play_game_challenge = function(idx){
        var primary_aud = get_audio(0);
        primary_aud.onended = function(){
            get_audio(priv.position).play();
        };
        primary_aud.play();
    },
    start_new_game = function(){
        set_random_challenge();
        priv.got_challenge = true;
        update_buttons();
        set_message('');
    },
    check_answer = function(idx){
        priv.got_challenge = false;
        update_buttons();
        var key=$('#submit-'+priv.position).attr('value');
        if (idx==priv.position)
        {
            priv.correct++;
            set_message('Correct: '+key, '#00ff00');
        }
        else
        {
            priv.wrong++;
            set_message('Wrong, correct answer: '+key, '#ff0000');
        }
        update_stats();
    },
    update_buttons = function(){
        $('form#answers input').prop('disabled', !priv.got_challenge);
        $('form#answers input#submit-0').prop('disabled', true);
        $('form#play input#play').prop('disabled', priv.got_challenge);
        $('form#play input#replay').prop('disabled', !priv.got_challenge);
        $('form#keys input').prop('disabled', priv.got_challenge);
        $('form#type input').prop('disabled', priv.got_challenge);
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
