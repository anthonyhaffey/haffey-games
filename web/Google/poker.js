function doGet(e){
  return initiate(e);
}

function doPost(e){
  return initiate(e);
}

function pilot_cache(){
  var cache = CacheService.getScriptCache();
  var cached = cache.get("room_code");
  if (cached != null) {
    return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  cache.put("room_code","beepbop",1500);
}

function initiate(e) {
  
  
  
  
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
      master_sheet = master_sheet.getSheetByName('Sheet1');
      
  
  var response = e.parameter;
  var action = response.action; //.toString();
  
  var player = response.player_name;
  
  
  
  switch(action){
    case "check_cache":
      //return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.JAVASCRIPT);
      
      var cache = CacheService.getScriptCache();
      var cached = cache.get("room_code");
      if (cached != null) {
        return ContentService.createTextOutput(cached).setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      cached.put("room_code","beepbop",1500);
      break;
      
    case "check_call":
      
      return check_call(response.collector_code,
                        response.player_name);
      
      break;
    case "create_room":
      return create_room(response.player_name);
      break;
    case "deal":
      var game_row = rowOfValue(master_sheet,   //looking within this
                            response.collector_code, //looking for this
                            0);             //looking in this column      
      deal_cards(fill_deck(),game_row);
      
      break;
    case "everybody_in":
      everybody_in(response.collector_code);
      break;
    case "fold":
      fold(response.collector_code,
           response.player_name);
    case "join":
      join_room(response.collector_code,
                response.player_name);
      break;
    case "raise":
      raise(response.collector_code,
            response.player_name,
            response.amount);
  }
  
}



function load_room(room_code){
  
}


function update_room(room_code,
                     room_obj){
  var filename = room_code + ".json";
  var folder = getOrCreateSubFolder('TexasHoldEm','apps');
  try {
    // filename is unique, so we can get first element of iterator
    var file = folder.getFilesByName(filename).next()
    file.setContent(JSON.stringify(room_obj));
  } catch(e) {
    folder.createFile(filename, JSON.stringify(room_obj));
  }
}

//solution by k4k4sh1 at https://stackoverflow.com/questions/48516036/how-to-check-if-a-folder-exists-in-a-parent-folder-using-app-script

function getOrCreateSubFolder(childFolderName, parentFolderName) {
  var parentFolder, parentFolders;
  var childFolder, childFolders;
  // Gets FolderIterator for parentFolder
  parentFolders = DriveApp.getFoldersByName(parentFolderName);
  // Checks if FolderIterator has Folders with given name
  //Assuming there's only a parentFolder with given name...  
  while (parentFolders.hasNext()) {
    parentFolder = parentFolders.next();
  }
  // If parentFolder is not defined it sets it to root folder
  if (!parentFolder) { parentFolder = DriveApp.getRootFolder(); }
  // Gets FolderIterator for childFolder
  childFolders = parentFolder.getFoldersByName(childFolderName);
  // Checks if FolderIterator has Folders with given name
  //Assuming there's only a childFolder with given name...  
  while (childFolders.hasNext()) {
    childFolder = childFolders.next();
  }
  // If childFolder is not defined it creates it inside the parentFolder
  if (!childFolder) { parentFolder.createFolder(childFolderName); }
  return childFolder;
}

function raise(collector_code,
               player_name,
               raise_amount){
  
  
  player_name = player_name.toUpperCase();
  
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  var game_row = rowOfValue(master_sheet,   //looking within this
                            collector_code, //looking for this
                            0);             //looking in this column
  var roomobj = JSON.parse(master_sheet.getRange(game_row,3).getValues()[0]);
  
  
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
  master_sheet.getRange(1,18).setValue("hi - " + JSON.stringify(current_bets));
  if(current_bets.every( (val, i, arr) => val === arr[0] )){ //i.e. there are at least 2 people with equal bets so move onto the next round
    //master_sheet.getRange(1,18).setValue("hi - " + JSON.stringify(current_bets));
    roomobj.round_phase++;
    if(roomobj.round_phase > 3){
      roomobj = resolve_bets(roomobj);
      master_sheet.getRange(1,19).setValue("HIHIHI");
      master_sheet.getRange(game_row,3).setValue(JSON.stringify(roomobj));
      
    } else {
      roomobj = round_progress(roomobj);
    }
    
  } else {
    roomobj = next_player(roomobj);  
  }
  
  
  master_sheet.getRange(game_row,3).setValue(JSON.stringify(roomobj));
  
  
}

function pilot_check_call(){
  check_call("kKCU0NeAw6Q3","ANT");
}

function check_call(collector_code,
                    player_name){
  
  player_name = player_name.toUpperCase();
  
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  var game_row = rowOfValue(master_sheet,   //looking within this
                            collector_code, //looking for this
                            0);             //looking in this column
  var roomobj = JSON.parse(master_sheet.getRange(game_row,3).getValues()[0]);
  
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
  master_sheet.getRange(1,18).setValue("hi - " + JSON.stringify(current_bets));
  if(current_bets.every( (val, i, arr) => val === arr[0] )){ //i.e. there are at least 2 people with equal bets so move onto the next round
    //master_sheet.getRange(1,18).setValue("hi - " + JSON.stringify(current_bets));
    roomobj.round_phase++;
    if(roomobj.round_phase > 3){
      roomobj = resolve_bets(roomobj);
      master_sheet.getRange(1,19).setValue("HIHIHI");
      master_sheet.getRange(game_row,3).setValue(JSON.stringify(roomobj));
      
    } else {
      roomobj = round_progress(roomobj);
    }
    
  } else {
    roomobj = next_player(roomobj);  
  }
  
  
  master_sheet.getRange(game_row,3).setValue(JSON.stringify(roomobj));
  
  
  return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.JAVASCRIPT);
  
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
  fold("XA4zg6YsotCD","BOB");
}

function fold(collector_code,
              player_name){
  player_name = player_name.toUpperCase();
  
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  var game_row = rowOfValue(master_sheet,   //looking within this
                            collector_code, //looking for this
                            0);             //looking in this column
  var roomobj = JSON.parse(master_sheet.getRange(game_row,3).getValues()[0]);
  
  roomobj.players[player_name].current_bid = "fold";

  
  //move onto the next player
  //check if 2+ haven't yet folded and if there's a consistent bet
  var current_bets = [];
  Object.keys(roomobj.players).forEach(function(player){
    if(roomobj.players[player].current_bid !== "fold"){
      current_bets.push(roomobj.players[player].last_bet);
    }
  });
  master_sheet.getRange(3,17).setValue(JSON.stringify(current_bets));
  var round_over = false;
  if(current_bets.length > 1){
    if(current_bets.every( (val, i, arr) => val === arr[0] )){ //i.e. there are at least 2 people with equal bets so move onto the next round
      master_sheet.getRange(1,18).setValue(JSON.stringify(current_bets));
      roomobj = round_progress(roomobj);
      master_sheet.getRange(1,18).setValue("nar nar");                                                         
      
      
    } else {
      roomobj = next_player(roomobj);//next player this round
      master_sheet.getRange(1,18).setValue("hardy");
      
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
  

  master_sheet.getRange(game_row,3).setValue(JSON.stringify(roomobj));
  if(round_over){
    deal_cards(fill_deck(),game_row);
  }
}

function next_player(roomobj){
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  
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
      
      master_sheet.getRange(2,18).setValue("brap");
      if(typeof(roomobj.players[current_player]) !== "undefined" &&
        roomobj.players[current_player].current_bid !== "fold"){
        selected_bidder = true;
        var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
        master_sheet = master_sheet.getSheetByName('Sheet1');
        
        master_sheet.getRange(2,18).setValue("got here");
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
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  
  //detect first blank row in code column
  var game_row = master_sheet.getLastRow()+1;
  
  var unique_code_needed = true;
  var room_code;
  while(unique_code_needed){
    var room_code = makeid(4)
    //check if the ID is one of the room codes
    targetValues = master_sheet.getRange(1, 1, 10, 5).getValues().filter(function (r) {
      return r[1] == room_code
    });
    if(targetValues.length == 0){        
      unique_code_needed = false;
    } 
  }
  
  master_sheet.getRange(game_row, 1).setValue(room_code);
  master_sheet.getRange(game_row, 2).setValue(player_name);
  
  
  //var list players in this room
  var room_info = {
    roomcode:room_code,
    player0:player_name
  }
  
  return ContentService.createTextOutput(JSON.stringify(room_info)).setMimeType(ContentService.MimeType.JAVASCRIPT); 
  
}
function pilot_everybody_in(room_code){
  everybody_in("KRj75JmD4grZ");
}

function everybody_in(room_code){
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  //detect if the collector_code exists
  var game_row = rowOfValue(master_sheet,   //looking within this
                            room_code, //looking for this
                            0);             //looking in this column
  
  // create the room_obj
  players = {};
  for(var i = 5; i < 16; i++){
    var this_player = master_sheet.getRange(game_row,i).getValues()[0]; 
    if(this_player !== ""){
      players[this_player] = {
        player_no:i-5,
        chips:1000,
        current_hand:[],
        current_bid:"waiting"
      }      
    }
  }
  
  // somehow a blank player seems to come through
  if(typeof(players[""]) !== "undefined"){
    delete(players[""]);
  }
  
  roomobj = {
    small_blind:1,
    small_blind_player:0,
    players : players,
    round : [0,0]
  }
  
  
  update_room(collector_code,
              roomobj)
  
  deal_cards(fill_deck(),game_row);
  
  return (master_sheet.getRange(game_row,1).getValues()[0]);
}

function pilot_deal_cards(){
  deal_cards(fill_deck(),4)
}


function deal_cards(this_deck,game_row){
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  
  var roomobj = JSON.parse(master_sheet.getRange(game_row,3).getValues()[0]);
  
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
  master_sheet.getRange(game_row,3).setValue(JSON.stringify(roomobj));
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

function pilot_join_room(){
  join_room("XA4zg6YsotCD",
            "bob");
}
function join_room(collector_code,
                   player_name){
  var upper_player_name = player_name.toUpperCase();
  var master_sheet = SpreadsheetApp.openById("1lp9SwAtHytTGCJFfTkA9VUDz1mEk3Oez2xlDFapPt8g");
  master_sheet = master_sheet.getSheetByName('Sheet1');
  //detect if the collector_code exists
  var game_row = rowOfValue(master_sheet,   //looking within this
                            collector_code, //looking for this
                            0);             //looking in this column
  
  if(game_row == undefined){
    /*
    game_row = master_sheet.getLastRow()+1;
    var room_code = makeid(4);
    master_sheet.getRange(game_row, 1).setValue(collector_code);
    master_sheet.getRange(game_row, 2).setValue(room_code);
    master_sheet.getRange(game_row, 5).setValue(player_name);
    */
  } else {
    //work out the participant number
    keep_searching = true;
    for(var i = 5; i < 15; i++){
      if(master_sheet.getRange(game_row,i).getValues()[0] == ""){
        if(keep_searching){
          master_sheet.getRange(game_row,i).setValue(upper_player_name);
          keep_searching = false;
        }
      } else if(master_sheet.getRange(game_row,i).getValues()[0] == upper_player_name){
        keep_searching = false;
      }
    }
    
    //complete_col = master_sheet.getDataRange().getValues()[0].length + 1;
    
    //master_sheet.getRange(2, 2).setValue("failed");
    // this should never ever happen (or at least is very very unlikely)
  }
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