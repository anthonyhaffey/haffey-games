function doGet(e){
  return initiate(e);
}

function doPost(e){
  return initiate(e);
}

function initiate(e) {
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
      master_sheet = master_sheet.getSheetByName('Sheet1');
      
  
  var response = e.parameter;
  var action = response.action; //.toString();
  
  var player = response.player_name;
  
  
  
  switch(action){
    case "check_call":
      return valid_return(check_call(response.room_code,
                                     response.player_name));
      break;
    case "create_room":
      return valid_return(create_room(response.player_name));
      break;
    case "deal":
      var cache = CacheService.getScriptCache();
      var roomobj = JSON.parse(cache.get(response.room_code));
      
      roomobj = deal_cards(fill_deck(),roomobj)
      
      cache.put(response.room_code,JSON.stringify(roomobj))
      
      return valid_return(JSON.stringify(roomobj));
      
      break;
    case "everybody_in":
      return valid_return(everybody_in(response.room_code));
      break;
    case "fold":
      return valid_return(fold(response.room_code,
                               response.player_name));
    case "join":
      return valid_return(join_room(response.room_code,
                                    response.player_name));
      break;
    case "new_player_wait":
      return valid_return(new_player_wait(response.room_code,
                                          response.players));
      break;                              
    case "raise":
      return valid_return(raise(response.room_code,
                                response.player_name,
                                response.amount));
      break;
    case "turn_wait":
      return valid_return(turn_wait(response.room_code,
                                    response.this_room));
      break;
  }
  
}

function pilot_turn_wait(){
  var cache = CacheService.getScriptCache();
  
  turn_wait("VRRQ",
            cache.get("VRRQ"));
  
}

function turn_wait(room_code,
                   this_room){
  
  
  //return room_info;
  
  var cache = CacheService.getScriptCache();
  var this_room = JSON.parse(this_room);
  var old_round = this_room.round;
  var turn_waiting = true;
  
  
  while(turn_waiting){
    Utilities.sleep(1000);
    var local_cached = JSON.parse(cache.get(room_code));
    if(JSON.stringify(local_cached.round) !== JSON.stringify(old_round)){
      turn_waiting = false;
      return JSON.stringify(local_cached);
    }
  }
  
}



function pilot_join_room(){
  join_room("A0VZ",
            "BOB");
}
function join_room(room_code,
                   player_name){
  
  
  //return room_code;
  
  var cache = CacheService.getScriptCache();
  var cached = JSON.parse(cache.get(room_code));
  
  
  if(typeof(cached.players.length) !== "undefined" && cached.players.indexOf(player_name) == -1){
    cached.players.push(player_name);    
  }
  
  cache.put(room_code,JSON.stringify(cached));
  return JSON.stringify(cached.players);
}

function valid_return(content){
  return ContentService.createTextOutput(content).setMimeType(ContentService.MimeType.JAVASCRIPT); 
}

function pilot_new_player_wait(){
  new_player_wait("DOY0",["ANT"]);
}

function fresh_update(your_variable, random_seed){
  
  return your_variable;
}

function new_player_wait(room_code,
                         players){
  
  players = JSON.parse(players);
  
  var cache = CacheService.getScriptCache();
  
  
  var cached = JSON.parse(cache.get(room_code));
  
  var keep_searching = true;
  if (cached !== null) {
    
    while(keep_searching){
      Utilities.sleep(1000); 
      
      var loop_cached = fresh_update(JSON.parse(cache.get(room_code)));
            
      if(loop_cached.players.length > players.length){
        keep_searching = false;
        
        return JSON.stringify(loop_cached);
      } else if(typeof(loop_cached.dealer) !== "undefined"){
        keep_searching = false;
        return JSON.stringify(loop_cached);
      }
    }    
  } else {
    return "room doesn't exist";
  }
}

function pilot_raise(){
  raise("VNUB",
        "BOB",
        10)
}

function raise(room_code,
               player_name,
               raise_amount){
  
  player_name = player_name.toUpperCase();
  
  var cache = CacheService.getScriptCache();
  
  
  var roomobj = JSON.parse(cache.get(room_code));
  
  
  var max_bid = -1;
  Object.keys(roomobj.players).forEach(function(player){
    if(roomobj.players[player].current_pot > max_bid){
      max_bid = roomobj.players[player].current_pot;
    }
  });
  
  if(parseFloat(max_bid) + parseFloat(raise_amount) > roomobj.players[player_name].chips - parseFloat(roomobj.players[player_name].current_pot)){
    raise_amount-= (parseFloat(max_bid) + parseFloat(raise_amount)) - (roomobj.players[player_name].chips - parseFloat(roomobj.players[player_name].current_pot));
  }
  
  roomobj.players[player_name].chips-= parseFloat(raise_amount) + parseFloat(max_bid) - parseFloat(roomobj.players[player_name].current_pot);
  
  roomobj.players[player_name].current_pot = parseFloat(max_bid) + parseFloat(raise_amount);
  roomobj.players[player_name].last_bet  = parseFloat(max_bid)  + parseFloat(raise_amount);
  
  
  
  var not_folded = 0;
  var current_bets = [];
  Object.keys(roomobj.players).forEach(function(player){
    if(roomobj.players[player].current_bid !== "fold"){
      not_folded++;
      current_bets.push(roomobj.players[player].last_bet);
    }
  });
  if(current_bets.every( (val, i, arr) => val === arr[0] )){ //i.e. there are at least 2 people with equal bets so move onto the next round
    roomobj.round_phase++;
    if(roomobj.round_phase > 3){
      roomobj = resolve_bets(roomobj);
    } else {
      roomobj = round_progress(roomobj);
    }
    
  } else {
    roomobj = next_player(roomobj);  
  }
  cache.put(room_code,JSON.stringify(roomobj));
  return JSON.stringify(roomobj);
}

function pilot_check_call(){
  check_call("VDHS","ANT");
}

function check_call(room_code,
                    player_name){
  
  player_name = player_name.toUpperCase();
  
  var cache = CacheService.getScriptCache();
  var roomobj = JSON.parse(cache.get(room_code));
  
  var max_bid = -1;
  Object.keys(roomobj.players).forEach(function(player){
    if(roomobj.players[player].current_pot > max_bid){
      max_bid = roomobj.players[player].current_pot;
    }
  });
  
  roomobj.players[player_name].chips-= parseFloat(max_bid) - parseFloat(roomobj.players[player_name].current_pot);
  
  roomobj.players[player_name].current_pot = max_bid;
  roomobj.players[player_name].last_bet  = max_bid;
  
  var not_folded = 0;
  var current_bets = [];
  Object.keys(roomobj.players).forEach(function(player){
    if(roomobj.players[player].current_bid !== "fold"){
      not_folded++;
      current_bets.push(roomobj.players[player].last_bet);
    }
  });
  if(current_bets.every( (val, i, arr) => val === arr[0] )){ //i.e. there are at least 2 people with equal bets so move onto the next round
    //master_sheet.getRange(1,18).setValue("hi - " + JSON.stringify(current_bets));
    roomobj.round_phase++;
    if(roomobj.round_phase > 3){
      roomobj = resolve_bets(roomobj);
      roomobj.round[2]++;
    } else {
      roomobj = round_progress(roomobj);
    }
    
  } else {
    roomobj = next_player(roomobj);  
  }
  
  cache.put(room_code,JSON.stringify(roomobj));
  
  return JSON.stringify(roomobj);
  
} 

function resolve_bets(roomobj){
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
    master_sheet = master_sheet.getSheetByName('Sheet1');
  var winning_player = {
    players:"tbc",
    rank:-1,
    hand:[],
    hand_score:[],
    draw_player:[]
  };
  Object.keys(roomobj.players).forEach(function(player,debug_row){
    //only consider if they haven't folder
    if(roomobj.players[player].current_bid !== "fold"){
      //detect what the hand is first
      var all_cards = roomobj.players[player].current_hand.concat(roomobj.middle_cards);
      [hand_description,player_best_hand,hand_score] = evaluate_hand(all_cards);
      
      master_sheet.getRange(debug_row+6,16).setValue(JSON.stringify(hand_score));
      
      hand_score = parseFloat(hand_score[0]) * 10000 +
                   parseFloat(hand_score[1]) * 1000 +
                   parseFloat(hand_score[2]) * 100 +
                   parseFloat(hand_score[3]) * 10 +
                   parseFloat(hand_score[4])
      
      
                   
      
      if(hand_score > winning_player.hand_score){
        winning_player.players          = [player];
        winning_player.hand             = player_best_hand;
        winning_player.hand_score       = hand_score;
        winning_player.hand_description = hand_description;
      } else if(hand_score == winning_player.hand_score){
        winning_player.players.push(player);
      }
    }
  });
  
  var the_pot = 0;
  Object.keys(roomobj.players).forEach(function(player){
    the_pot += roomobj.players[player].current_pot;
  });
  
  if(winning_player.players.length == 1){ // give all the money to one player
    roomobj.players[winning_player.players[0]].chips += the_pot;
    roomobj.winner = [winning_player.players];
    roomobj.winning_hand = winning_player.hand_description;
  } else {                              // split the money between the winners
    var split_pot = the_pot/winning_player.players.length;
    
    
    master_sheet.getRange(4,16).setValue(JSON.stringify(winning_player));
    
    Object.keys(winning_player.players).forEach(function(player){
      roomobj.players[player].chips += split_pot;
    });
    roomobj.winner = [winning_player.players];
    roomobj.winner_hand = winning_player.hand_description;
  }
  return roomobj;
}

function pilot_evaluate_hand(){
  all_cards = [{
    card_no : 14,
    suit    : "diamond"
  },{
    card_no : 14,
    suit    : "heart"
  },{
    card_no : 4,
    suit    : "spade"
  },{
    card_no : 2,
    suit    : "diamond"
  },{
    card_no : 3,
    suit    : "diamond"
  },{
    card_no : 4,
    suit    : "diamond"
  },{
    card_no : 5,
    suit    : "diamond"
  }];
  
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  master_sheet.getRange(1,17).setValue(JSON.stringify(evaluate_hand(all_cards)));
  
  //JSON.stringify(evaluate_hand);
}

function evaluate_hand(all_cards){
  //count occurrences of each suit
  var hand_summary = {
    flush:false,
    four_of_a_kind: false,
    pair:false,
    full_house: false,
    three_of_a_kind: false,
    two_pairs: false,
    straight:false,
    straight_flush:false,
    ordered_cards:[],
    possible_straights:[],
    suit_count:{
      club:0,
      diamond:0,
      heart:0,
      spade:0
    }
  }
  all_cards.forEach(function(card){
    //ordering for straight calculations later
    hand_summary.ordered_cards.push(card.card_no);
    
    
    //flush calculations
    hand_summary.suit_count[card.suit]++;
    if(hand_summary.suit_count[card.suit] > 4){
      //hand_summary.flush = true;
      hand_summary.flush = all_cards.filter(function(flush_card){
        return flush_card.suit == card.suit;
      });
    }
  });
  hand_summary.ordered_cards = hand_summary.ordered_cards.sort((a, b) => a - b);
  if(hand_summary.ordered_cards.indexOf(14) !== -1){
    hand_summary.ordered_cards= [1].concat(hand_summary.ordered_cards);
  }
  
  if(hand_summary.flush !== false){
    
    hand_summary.flush = hand_summary.flush.map(function(card){
      return card.card_no;
    });
    
    
    hand_summary.flush = hand_summary.flush.sort((a, b) => a - b); 
    while(hand_summary.flush.length > 5){      //trim to remove the next bottom
      hand_summary.flush.splice(5,1);
    }
  }
  
  //check straight
  var in_a_row    = [];
  var last_number = -1;
  var sequences   = [[]];
  hand_summary.ordered_cards.forEach(function(this_no){
    if(this_no == last_number + 1){
      in_a_row[in_a_row.length-1]++;
      if(sequences[in_a_row.length-1].length == 0){
        sequences[in_a_row.length-1].push(last_number)
      }
      sequences[in_a_row.length-1].push(this_no);
      if(in_a_row[in_a_row.length-1] > 4){
        hand_summary.straight = sequences[in_a_row.length-1];
      }
    } else if(this_no !== last_number){
      in_a_row.push(1);
      sequences.push([])
    }
    last_number = this_no;
  });
  
  
  
  

  // straight flush
  if(hand_summary.straight){
    

    //now just need to detect if it's a straight flush - filter by suit..?
    ["club","diamond","heart","spade"].forEach(function(suit){
      var suit_cards = all_cards.filter(function(card){
        return card.suit == suit;
      });
      
      suit_cards = all_cards.map(function(card){
        return card.card_no;
      });
      
      //order the cards
      in_a_row = [0];
      last_number = -1;
      sequences   = [[]];
      suit_cards = suit_cards.sort((a, b) => a - b)
      
      if(suit_cards.indexOf(14) !== -1){
        suit_cards= [1].concat(suit_cards);
      }
      
      
      var in_a_row    = [];
      var last_number = -1;
      var sequences   = [[]];
      suit_cards.forEach(function(this_no){
        if(this_no == last_number + 1){
          in_a_row[in_a_row.length-1]++;
          if(sequences[in_a_row.length-1].length == 0){
            sequences[in_a_row.length-1].push(last_number)
          }
          sequences[in_a_row.length-1].push(this_no);
          if(in_a_row[in_a_row.length-1] > 4){
            hand_summary.straight_flush = sequences[in_a_row.length-1];
          }
        } else if(this_no !== last_number){
          in_a_row.push(1);
          sequences.push([])
        }
        last_number = this_no;
      });
    });
  }
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  master_sheet.getRange(1,18).setValue(JSON.stringify(hand_summary.straight_flush));

  while(hand_summary.straight_flush.length > 5){
    hand_summary.straight_flush.splice(0,1);
  }
  
  while(hand_summary.straight.length > 5){
    hand_summary.straight.splice(0,1);
  }

  

  
  //count how the hand is distributed
  var same_numbers = {};
  hand_summary.ordered_cards.forEach(function(card_no){
    if(typeof(same_numbers[card_no]) == "undefined"){
      same_numbers[card_no] = 1;
    } else {
      same_numbers[card_no]++;
    }
  });
  
   
  hand_summary.full_house = {
    three: -1,  
    two:   -1
  }; 
  hand_summary.two_pair   = {
    pair_1:-1,
    pair_2:-1,
    high:-1
  }
  hand_summary.three_kind = {
    three: -1,
    high_1:-1,
    high_2:-1
  };
  hand_summary.four_kind = {
    four: -1,
    high: -1
  }
  hand_summary.one_pair = {
    pair: -1,
    high_1:-1,
    high_2:-1,
    high_3:-1
  }
  

  Object.keys(same_numbers).forEach(function(same_number){
    switch(same_numbers[same_number]){
      case 4:
        hand_summary.four_kind.four = same_number;
        break;  
      case 3:
        hand_summary.full_house.three = same_number;
        hand_summary.three_kind.three = same_number;
        break;
      case 2:
        //full house
        if(same_number > hand_summary.full_house.two){
          hand_summary.full_house.two = same_number;
        }
        //two pair
        if(same_number > hand_summary.two_pair.pair_1){
          hand_summary.two_pair.pair_2 = hand_summary.two_pair.pair_1;
          hand_summary.two_pair.pair_1 = same_number;
        } else if(same_number > hand_summary.two_pair.pair_2){
          hand_summary.two_pair.pair_2 = same_number;
        }
        //pair
        if(same_number > hand_summary.one_pair.pair){
          hand_summary.one_pair.pair = same_number
        }
        
        break;
      case 1:
        //four_kind
        if(same_number > hand_summary.four_kind.high){
          hand_summary.four_kind.high = same_number;
        }
        //three_kind
        if(same_number > hand_summary.three_kind.high_2){
          hand_summary.three_kind.high_2 = hand_summary.three_kind.high_1;
          hand_summary.three_kind.high_1 = same_number;
        } else if(same_number > hand_summary.three_kind.high_2){
          hand_summary.three_kind.high_2 = same_number;
        }
        
        //two_pair
        if(same_number > hand_summary.two_pair.high){
          hand_summary.two_pair.high = same_number;
        }
        //one_pair
        if(same_number > hand_summary.one_pair.high_1){
          hand_summary.one_pair.high_3 = hand_summary.one_pair.high_2;
          hand_summary.one_pair.high_2 = hand_summary.one_pair.high_1;
          hand_summary.one_pair.high_1 = same_number;
        } else if(same_number > hand_summary.one_pair.high_2){
          hand_summary.one_pair.high_3 = hand_summary.one_pair.high_2;
          hand_summary.one_pair.high_2 = same_number;
        } else if(same_number > hand_summary.one_pair.high_3){
          hand_summary.one_pair.high_3 = same_number;
        }
        break;
    }
  });
  
  
  var hand_score = [-1,0,0,0,0,0];
  
  var hand_strength = 0;
  var hand_description = "";
  if(hand_summary.straight_flush !== false){
    hand_strength = "straight flush";
    hand_description = hand_summary.straight_flush;
    hand_score = [8].concat(hand_summary.straight_flush);
  } else if(hand_summary.four_kind.four !== -1){
    hand_strength = "four of a kind";
    hand_description = hand_summary.four_kind;
    hand_score = [7].concat([hand_summary.four_kind.four,
                             hand_summary.four_kind.high,
                             0,
                             0,
                             0]);
  } else if(hand_summary.full_house.three !== -1 &&
            hand_summary.full_house.two   !== -1){
    hand_strength = "full house";
    hand_description = hand_summary.full_house;
    hand_score = [6].concat([hand_summary.full_house.three,
                             hand_summary.full_house.two,
                             0,
                             0,
                             0]);
  } else if(hand_summary.flush !== false){
    hand_strength = "flush";
    hand_description = hand_summary.flush;
    hand_score = [5].concat(hand_summary.flush);
  } else if(hand_summary.straight !== false){
    hand_strength = "straight";
    hand_description = hand_summary.straight;
    hand_score = [4].concat(hand_summary.straight);
  } else if(hand_summary.three_kind.three !== -1){
    hand_strength = "three of a kind";
    hand_description = hand_summary.three_kind;
    hand_score = [3].concat([hand_summary.three_kind.three,
                             hand_summary.three_kind.high_1,
                             hand_summary.three_kind.high_2,
                             0,
                             0]);
  } else if(hand_summary.two_pair.pair_1 !== -1 &&
            hand_summary.two_pair.pair_2 !== -1){
    hand_strength = "two pairs";
    hand_description = hand_summary.two_pair;
    hand_score = [2].concat([hand_summary.two_pair.pair_1,
                             hand_summary.two_pair.pair_2,
                             hand_summary.two_pair.high,
                             0,
                             0]);
  } else if(hand_summary.one_pair.pair !== -1){
    hand_strength = "one pair";
    hand_description = hand_summary.one_pair;
    hand_score = [1].concat([hand_summary.one_pair.pair,
                             hand_summary.one_pair.high_1,
                             hand_summary.one_pair.high_2,
                             hand_summary.one_pair.high_3,
                             0]);
  } else {
    hand_strength = "high card";
    hand_description = hand_summary.ordered_cards;
    while(hand_description.length >5){
      hand_description.splice(0,1);
    }
    hand_score = [0].concat(hand_description);
  }
  return ([hand_strength,hand_description,hand_score]);
}

function round_progress(roomobj){
  roomobj.current_bidder = (roomobj.first_bidder - 1) % Object.keys(roomobj.players).length;
  roomobj = next_player(roomobj);
  Object.keys(roomobj.players).forEach(function(this_player){
    roomobj.players[this_player].last_bet = -1;    
  });
  
  
  
  return(roomobj);                                  
}

function pilot_fold(){
  fold("KATY","BOB");
}

function fold(room_code,
              player_name){
  player_name = player_name.toUpperCase();
  
  var cache = CacheService.getScriptCache();
  var roomobj = JSON.parse(cache.get(room_code))
 
  roomobj.players[player_name].current_bid = "fold";

  
  //move onto the next player
  //check if 2+ haven't yet folded and if there's a consistent bet
  var current_bets = [];
  Object.keys(roomobj.players).forEach(function(player){
    if(roomobj.players[player].current_bid !== "fold"){
      current_bets.push(roomobj.players[player].last_bet);
    }
  });
  var round_over = false;
  if(current_bets.length > 1){
    if(current_bets.every( (val, i, arr) => val === arr[0] )){ //i.e. there are at least 2 people with equal bets so move onto the next round
      roomobj = round_progress(roomobj);
      
      
    } else {
      roomobj = next_player(roomobj);//next player this round
      
    }
  } else {                                                     //settle up
    var winners_chips = count_chips(roomobj);
    Object.keys(roomobj.players).forEach(function(player){
      if(roomobj.players[player].current_bid !== "fold"){
        roomobj.players[player].chips += winners_chips;
      }
    });
    round_over = true;
  }
  

  if(round_over){
    roomobj = deal_cards(fill_deck(),roomobj);
  }
  
  cache.put(room_code,JSON.stringify(roomobj));
  
  return JSON.stringify(roomobj);
}

function next_player(roomobj){
  
  roomobj.round[2]++;
  
  var valid_bidders = Object.keys(roomobj.players).filter(function(player){
    return roomobj.players[player].current_bid !== "fold";
  });
  
  if(valid_bidders.length > 1){
    var selected_bidder = false;
    while(selected_bidder == false){
      roomobj.current_bidder++;
      roomobj.current_bidder = roomobj.current_bidder % Object.keys(roomobj.players).length;
      var current_player = Object.keys(roomobj.players).filter(function(player){
        return roomobj.players[player].player_no == roomobj.current_bidder;
      })[0];
      
      if(typeof(roomobj.players[current_player]) !== "undefined" &&
        roomobj.players[current_player].current_bid !== "fold"){
        selected_bidder = true;
        
        Object.keys(roomobj.players).forEach(function(this_player){
          if(this_player == current_player){
            roomobj.players[this_player].current_bid = "your turn";
          } else {
            if(roomobj.players[this_player].current_bid !== "fold"){
              roomobj.players[this_player].current_bid = "waiting"
            }
          }
        });
      }
    }
  }
  return roomobj;
}

function count_chips(roomobj){
  chips_total = 0;
  Object.keys(roomobj.players).forEach(function(player){
    chips_total += roomobj.players[player].current_pot;
  });
  return chips_total;
}

function pilot_create_room(){
  create_room("tdawg");
}

function create_room(player_name){
  player_name = player_name.toUpperCase();
  var cache = CacheService.getScriptCache();
  var room_code;
  var unique_code_needed = true;
  while(unique_code_needed){
    var room_code = makeid(4);
    
    if (cache.get("room_code") === null) {
      unique_code_needed = false;
    }
  }
  
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  var game_row = master_sheet.getLastRow() + 1
  master_sheet.getRange(game_row,1).setValue(room_code);
  master_sheet.getRange(game_row,2).setValue((new Date()).getTime());
  master_sheet.getRange(game_row,3).setValue(Date(parseInt((new Date()).getTime(), 10)).toString('MM/dd/yy HH:mm:ss'));
  
  var room_info = {
    room_code:room_code,
    players: [player_name]
  }
  
  cache.put(room_code,JSON.stringify(room_info),1500);  
  
  return JSON.stringify(room_info);
}
function pilot_everybody_in(){
  
  //console.log("hi");
  everybody_in("B8RK");
}

function everybody_in(room_code){
  
  var cache = CacheService.getScriptCache();
  var cached = JSON.parse(cache.get(room_code));
  
  console.log(JSON.stringify(cached));
  
  var cached_players = JSON.parse(JSON.stringify(cached.players));
  cached.players = {};
  cached_players.forEach(function(player,player_no){
    cached.players[player] = {
      player_no:player_no,
      chips:1000,
      current_hand:[],
      current_bid:"waiting"
    }
  });
  console.log(JSON.stringify(cached));
  
  cached.small_blind  = 1;
  cached.small_blind_player = 0;
  cached.round = [0,0,0];

  
  
  cached = deal_cards(fill_deck(),cached);
  
  console.log(JSON.stringify(cached));
  
  cache.put(room_code,JSON.stringify(cached));  
  
  
  return (JSON.stringify(cached));
  
}

function pilot_deal_cards(){
  deal_cards(fill_deck(),4)
}


function deal_cards(this_deck,roomobj){
  
  var players = Object.keys(roomobj.players);
  roomobj.small_blind_player++;
  
  roomobj.small_blind_player = roomobj.small_blind_player % players.length;
  roomobj.large_blind_player = (roomobj.small_blind_player + 1) % players.length;
  roomobj.first_bidder       = (roomobj.small_blind_player + 2) % players.length;
  roomobj.dealer             = (roomobj.small_blind_player - 1) % players.length;
  roomobj.current_bidder     = roomobj.first_bidder;
  roomobj.winner             = [];
  
  roomobj.round[1]++;
  if(roomobj.round[1] == players.length){
    roomobj.round[1] = 0;
    roomobj.round[0]++;
    roomobj.small_blind = roomobj.small_blind * 2;
  }
  roomobj.round[2] = 0;
  
  if(roomobj.small_blind_player > players.length - 1){
    roomobj.small_blind_player = 1;
  }
  players.forEach(function(player,player_no){
    // set the blinds
    //calculate modulus
    
    roomobj.players[player].last_bet = -1;
    
    if(player_no == roomobj.small_blind_player){
      roomobj.players[player].current_bid = "small blind";
      roomobj.players[player].chips = roomobj.players[player].chips - roomobj.small_blind;
      roomobj.players[player].current_pot = roomobj.small_blind;
    } else if(player_no == roomobj.large_blind_player){
      roomobj.players[player].current_bid = "large blind";
      roomobj.players[player].chips = roomobj.players[player].chips - roomobj.small_blind * 2;
      roomobj.players[player].current_pot = roomobj.small_blind * 2;
    } else {
      roomobj.players[player].current_bid = "waiting";
      roomobj.players[player].current_pot = 0;
    }
    if(player_no == roomobj.first_bidder){
      roomobj.turn = player;
      roomobj.players[player].current_bid = "your turn";
    }
    if(player_no == roomobj.dealer){
      roomobj.players[player].dealer = true;
    } else {
      roomobj.players[player].dealer = false;
    }
    
    // deal the cards
    var first_card = this_deck.pop();
    var second_card = this_deck.pop();
    roomobj.players[player].current_hand = [first_card,
                                            second_card];
  });
  roomobj.middle_cards = [];
  
  for(var i=0; i<5; i++){
    roomobj.middle_cards.push(this_deck.pop());
  }
  roomobj.round_phase = 0; //opening
  roomobj.this_deck = this_deck;
  //master_sheet.getRange(game_row,3).setValue(JSON.stringify(roomobj));
  return roomobj;
}
function fill_deck(){
  this_deck = [];
  var suits = ["club","diamond","heart","spade"];
  for(var card_no = 2; card_no < 15; card_no++){
    var card_look = card_no;
    if(card_no > 10){
      switch(card_no){
        case 11:
          card_look = "jack";
          break;
        case 12:
          card_look = "queen";
          break;
        case 13:
          card_look = "king";
          break;
        case 14:
          card_look = "1";
          break;
      }
    }
    suits.forEach(function(suit){
      this_deck.push({
        card_file: suit + "_" + card_look + ".png",
        card_no:   card_no,
        suit:      suit
      });
    });
  }
  shuffled_deck = shuffle(this_deck);
  return shuffled_deck;
}


//based on solution by csharptest.net at https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

//based on Stéphane's solution at https://stackoverflow.com/questions/32565859/find-cell-matching-value-and-return-rownumber/32567126
function rowOfValue(this_sheet,cell_value,column_index){  
  var data = this_sheet.getDataRange().getValues();  
  for(var i = 0; i<data.length;i++){
    if(data[i][column_index] == cell_value){
      return i+1;
    }
  }
}

// solution found at https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


/* backup of redundant scoring code
var hand_ranks = {
    "high card":{
      rank:0      // done
    },
    "one pair":{      // done
      rank:1
    },
    "two pairs":{    //done
      rank:2
    },
    "three of a kind":{    //done
      rank:3
    },
    "straight":{  //done
      rank:4
    },
    "flush":{      //done
      rank:5
    },
    "full house":{ //done
      rank:6
    },
    "four of a kind":{ //done
      rank:7
    },
    "straight flush":{ //done
      rank:8
    }
  }

      var this_rank = hand_ranks[hand_description].rank;
      if(this_rank > winning_player.rank){
        winning_player.player = player;
        winning_player.rank = this_rank;
        winning_player.hand = player_best_hand;
        winning_player.draw_player = [];
          
      } else if(this_rank == hand_ranks[hand_description].rank){
        //need to resolve draw
        switch(hand_description){
          case "straight_flush":
          case "straight":
            //need to see what the highest card was for each player
            var old_player_max = winning_player.hand[4];
            var new_player_max = player_best_hand[4];
            if(old_player_max < new_player_max){
              winning_player.player = player;
              winning_player.rank = this_rank;
              winning_player.hand = player_best_hand;
              winning_player.draw_player = [];
            } else if(old_player_max == new_player_max){
              winning_player.draw_player.push(player);
            }
            //else ignore the new player
            
            break;
          case "three of a kind":
            var old_player_three = winning_player.hand.three;
            var new_player_three = player_best_hand.three;
            
            var old_player_high_1 = winning_player.hand.high_1;
            var new_player_high_1 = player_best_hand.high_1;
            
            var old_player_high_2 = winning_player.hand.high_2;
            var new_player_high_2 = player_best_hand.high_2;
            
            if(old_player_three < new_player_three){
              winning_player.player = player;
              winning_player.rank = this_rank;
              winning_player.hand = player_best_hand;
              winning_player.draw_player = [];
            } else if(old_player_three == new_player_three){
              if(old_player_high_1 < new_player_high_1){
                winning_player.player = player;
                winning_player.rank = this_rank;
                winning_player.hand = player_best_hand;
                winning_player.draw_player = [];
              } else if(old_player_high_1 == new_player_high_1){
                if(old_player_high_2 < new_player_high_2){
                  winning_player.player = player;
                  winning_player.rank = this_rank;
                  winning_player.hand = player_best_hand;
                  winning_player.draw_player = [];
                } else if(old_player_high_2 == new_player_high_2){
                  winning_player.draw_player.push(player);
                } 
              }
            }
            //else ignore the new player
                
            break;
          case "two pairs":
            var old_player_pair_1 = winning_player.hand.pair_1;
            var new_player_pair_1 = player_best_hand.pair_1;
            
            var old_player_pair_2 = winning_player.hand.pair_2;
            var new_player_pair_2 = player_best_hand.pair_2;
            
            var old_player_high = winning_player.hand.high;
            var new_player_high = player_best_hand.high;
            
            if(old_player_pair_2 < new_player_pair_2){
              winning_player.player = player;
              winning_player.rank = this_rank;
              winning_player.hand = player_best_hand;
              winning_player.draw_player = [];
            } else if(old_player_pair_2 == new_player_pair_2){
              if(old_player_pair_1 < new_player_pair_1){
                winning_player.player = player;
                winning_player.rank = this_rank;
                winning_player.hand = player_best_hand;
                winning_player.draw_player = [];
              } else if(old_player_pair_1 == new_player_pair_1){
                if(old_player_high < new_player_high){
                  winning_player.player = player;
                  winning_player.rank = this_rank;
                  winning_player.hand = player_best_hand;
                  winning_player.draw_player = [];
                } else if(old_player_high == new_player_high){
                  winning_player.draw_player.push(player);
                } 
              }
            }
            //else ignore the new player
                
            break;
          case "full house":
            var old_player_three = winning_player.hand.three;
            var new_player_three = player_best_hand.three;
            
            var old_player_two = winning_player.hand.two;
            var new_player_two = player_best_hand.two;
            
            if(old_player_three < new_player_three){
              winning_player.player = player;
              winning_player.rank = this_rank;
              winning_player.hand = player_best_hand;
              winning_player.draw_player = [];
            } else if(old_player_three == new_player_three){
              if(old_player_two < new_player_two){
                winning_player.player = player;
                winning_player.rank = this_rank;
                winning_player.hand = player_best_hand;
                winning_player.draw_player = [];
              } else if(old_player_two == new_player_two){
                winning_player.draw_player.push(player); 
              }
            }
            //else ignore the new player
                
            break;
          case "four of a kind":
            var old_player_four = winning_player.hand.four;
            var new_player_four = player_best_hand.four;
            
            var old_player_high = winning_player.hand.high;
            var new_player_high = player_best_hand.high;
            
            if(old_player_four < new_player_four){
              winning_player.player = player;
              winning_player.rank = this_rank;
              winning_player.hand = player_best_hand;
              winning_player.draw_player = [];
            } else if(old_player_four == new_player_four){
              if(old_player_high < new_player_high){
                winning_player.player = player;
                winning_player.rank = this_rank;
                winning_player.hand = player_best_hand;
                winning_player.draw_player = [];
              } else if(old_player_high == new_player_high){
                winning_player.draw_player.push(player); 
              }
            }
            //else ignore the new player
                
            break;
          case "one pair":
            var old_player_pair = winning_player.hand.pair;
            var new_player_pair = player_best_hand.pair;
            
            var old_player_high_1 = winning_player.hand.high_1;
            var new_player_high_1 = player_best_hand.high_1;

            var old_player_high_2 = winning_player.hand.high_2;
            var new_player_high_2 = player_best_hand.high_2;

            var old_player_high_3 = winning_player.hand.high_3;
            var new_player_high_3 = player_best_hand.high_3;
            
            if(old_player_pair < new_player_pair){
              winning_player.player = player;
              winning_player.rank = this_rank;
              winning_player.hand = player_best_hand;
              winning_player.draw_player = [];
            } else if(old_player_pair == new_player_pair){
              if(old_player_high_1 < new_player_high_1){
                winning_player.player = player;
                winning_player.rank = this_rank;
                winning_player.hand = player_best_hand;
                winning_player.draw_player = [];
              } else if(old_player_high_1 == new_player_high_1){
                if(old_player_high_2 < new_player_high_2){
                  winning_player.player = player;
                  winning_player.rank = this_rank;
                  winning_player.hand = player_best_hand;
                  winning_player.draw_player = [];
                } else if(old_player_high_2 == new_player_high_2){
                  if(old_player_high_3 < new_player_high_3){
                    winning_player.player = player;
                    winning_player.rank = this_rank;
                    winning_player.hand = player_best_hand;
                    winning_player.draw_player = [];
                  } else if(old_player_high_3 == new_player_high_3){
                    winning_player.draw_player.push(player);
                  }
                } 
              }
            }
            //else ignore the new player
                
            break;  
          case "flush":
          case "high card":
            if(winning_player.hand[4] < player_best_hand[4]){
              winning_player.player = player;
              winning_player.rank = this_rank;
              winning_player.hand = player_best_hand;
              winning_player.draw_player = [];
            } else if(winning_player.hand[4] == player_best_hand[4]){
              if(winning_player.hand[3] < player_best_hand[3]){
                winning_player.player = player;
                winning_player.rank = this_rank;
                winning_player.hand = player_best_hand;
                winning_player.draw_player = [];
              } else if(winning_player.hand[3] == player_best_hand[3]){
                if(winning_player.hand[2] < player_best_hand[2]){
                  winning_player.player = player;
                  winning_player.rank = this_rank;
                  winning_player.hand = player_best_hand;
                  winning_player.draw_player = [];
                } else if(winning_player.hand[2] == player_best_hand[2]){
                  if(winning_player.hand[1] < player_best_hand[1]){
                    winning_player.player = player;
                    winning_player.rank = this_rank;
                    winning_player.hand = player_best_hand;
                    winning_player.draw_player = [];
                  } else if(winning_player.hand[1] == player_best_hand[1]){
                    if(winning_player.hand[0] < player_best_hand[0]){
                      winning_player.player = player;
                      winning_player.rank = this_rank;
                      winning_player.hand = player_best_hand;
                      winning_player.draw_player = [];
                    } else if(winning_player.hand[0] == player_best_hand[0]){
                      winning_player.draw_player.push(player);
                    }
                  }
                }
              }
            }
        
            break;
        }        
      }
      
      */