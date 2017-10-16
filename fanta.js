
var Juventus = "Juventus";
var Milan = "Milan";
var Fiorentina = "Fiorentina";
var Atalanta = "Atalanta";
var Napoli = "Napoli";
var Cagliari = "Cagliari";
var Lazio = "Lazio";
var Sampdoria = "Sampdoria";
var Roma = "Roma";
var Inter = "Inter";
var Torino = "Torino";
var Benevento = "Benevento";
var SPAL = "SPAL";
var Genoa = "Genoa";

class Player {

  constructor(name, team, url, probResponse, matches){
    this.name = name;
    this.team = team;
    this.teamOrder = this.getOrderTeam(matches);
    this.avv = this.getAvv(matches);
    this.prob = this.getProb(probResponse);
    this.fantavoto = parseFloat(this.getVote(url));
    
  }

  getAvv(matches) {
    var indexTeam = matches.indexOf(this.team);
    if(indexTeam%2){
      return matches[indexTeam-1];
    }else{
      return matches[indexTeam+1];
    }
  }//getAvv

  getOrderTeam(matches){
    var indexTeam = matches.indexOf(this.team);
    if(indexTeam%2){
      return 1;
    }else{
      return 0;
    }

  }//getOrderTeam

  getProb(response) {
    
    //TITOLARE
    var idTag;
    if(this.teamOrder)
      idTag=this.avv+'-'+this.team;
    else
      idTag=this.team+'-'+this.avv;
    idTag = idTag.toLowerCase();

    var divTeam = this.getDivTag(idTag,response).childNodes[0].childNodes[1];
    var divTitolari = divTeam.childNodes[2];
    var players = divTitolari.childNodes[this.teamOrder+1].childNodes;
    for(var i=0;i<players.length;i++){
      var classWithName;
      if(this.teamOrder)
        classWithName = "right";
      else
        classWithName = "left";

      var playerDiv = players[i].getElementsByClassName(classWithName)[0];
      var playerName = playerDiv.getElementsByTagName('a')[0].innerHTML;
      if(playerName == this.name || playerName == (this.name).replace("-"," ")){
        var probability = playerDiv.getElementsByClassName('perc')[0].innerHTML;
        return probability;
      }
    }//for player

    var divPanchine = divTeam.childNodes[3].childNodes[0];

    // SQUALIFICATO
    var divSqual = divPanchine.childNodes[3].childNodes[this.teamOrder+1].childNodes[0];
    players = divSqual.getElementsByTagName('p');
    var find = -1;
    for(var i=0;i<players.length;i++){
      var tmpBalplayers = players[i].getElementsByTagName('span');
      
      for(var j=0;j<tmpBalplayers.length;j++){
        var fixedVal = tmpBalplayers[j].innerHTML.toLowerCase();
        fixedVal = fixedVal.replace(":","");
        fixedVal = fixedVal.replace(" ","");
        
        var fixedName = this.name.toLowerCase();
        fixedName = fixedName.replace(":","");
        fixedName = fixedName.replace(" ","");

        if(fixedVal == fixedName){
          find=i;
          break;
        }
      }
      if(find != -1)
        break;
    }//for player

    if(find != -1)
      return "Squalificato";

    // INDISPONIBILI
    var divIndisp = divPanchine.childNodes[3].childNodes[this.teamOrder+1].childNodes[1];
    players = divIndisp.getElementsByTagName('p');
    var find = -1;
    for(var i=0;i<players.length;i++){
      var tmpBalplayers = players[i].getElementsByTagName('span');
      
      for(var j=0;j<tmpBalplayers.length;j++){
        var fixedVal = tmpBalplayers[j].innerHTML.toLowerCase();
        fixedVal = fixedVal.replace(":","");
        fixedVal = fixedVal.replace(" ","");
        
        var fixedName = this.name.toLowerCase();
        fixedName = fixedName.replace(":","");
        fixedName = fixedName.replace(" ","");

        if(fixedVal == fixedName){
          find=i;
          break;
        }
      }
      if(find != -1)
        break;
    }//for player

    if(find != -1)
      return "Indisponibile";

    // BALLOTTAGGIO
    var divBallottaggio = divPanchine.childNodes[3].childNodes[this.teamOrder+1].childNodes[3];
    players = divBallottaggio.getElementsByTagName('p');
    
    for(var i=0;i<players.length;i++){
      var tmpBalplayers = players[i].getElementsByTagName('span');
      var find = -1;
      for(var j=0;j<tmpBalplayers.length;j++){
        if(tmpBalplayers[j].innerHTML.toLowerCase() == this.name.toLowerCase()){
          find=i;
          break;
        }
      }
    }//for player

    if(find == -1)
      return "PANCA";

    var divBalPlayer = players[find];
    var fixedName = lowerCaseAllWordsExceptFirstLetters(this.name);
  
    var p1 = divBalPlayer.innerHTML.split(fixedName);
    if(p1.length < 2)
      alert('errore');
    var probToFix = p1[1];
    var indexProb = probToFix.indexOf('%');
    var prob = probToFix.substring(indexProb-2,indexProb+1);
    prob = prob + ' B';
    var parts = divBalPlayer.innerHTML.split('-');
    var avvToFix;
    if(parts[0].toLowerCase().indexOf(fixedName.toLowerCase()) != -1){
      avvToFix = parts[1];
    }else{
      avvToFix= parts[0];
    }
    var avv = (avvToFix.split('>')[1].split('<')[0]).replace(" ","");
    
    return prob + " ( " + avv + " )";
    
  }

  getVote(url) {
    var response = httpGet(url);
    var parts = response.split("VOTO E FANTAVOTO");

    var part2 = parts[1];
    parts = part2.split("MEDIA VOTO");
    var part3 = parts[1];
    parts = part3.split("MEDIA FANTAVOTO");
    var part4 = parts[0];
    parts = part4.split("</p></div></div><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6 no-gutter rel bignum2 bx greybkg\"><p class=\"nbig2\">");
    var part5 = parts[1];
    parts = part5.split("<");

    var voto = parts[0].replace(",", ".");

    return voto;
  }

  getDivTag(id,response){
    
    var tag = "div";
    var idSeparator = "id=\""+id+"\"";
    var parts = response.split(idSeparator);
    
    if(parts.length < 2){
      idSeparator = "id=\'"+id+"\'";
      parts = response.split(idSeparator);
    }
  
    var p1 = parts[0]; 
    
    var divPieces = p1.split(tag); 
    var lastPieceDiv = divPieces[divPieces.length-1];
  
    var tagOpened = 1; //primo div all'inizio
    var tagClosed = 0;
  
    var stringToAnalyze  = lastPieceDiv +idSeparator + parts[1];
    var retString = "<"+tag;
    
    while(tagClosed != tagOpened){
      var indexDiv = stringToAnalyze.indexOf(tag);
      
      var characterBefore = stringToAnalyze.charAt(indexDiv-1);
      if(characterBefore == '/'){
        tagClosed++;
      }else{
        tagOpened++;
      }
  
      var justAnalyze = stringToAnalyze.substring(0,indexDiv + tag.length);
      retString = retString + justAnalyze;
  
      stringToAnalyze = stringToAnalyze.substring(indexDiv + tag.length, stringToAnalyze.length);;
    }
    retString = retString + ">";
    
    var parser = new DOMParser();
    var doc = parser.parseFromString(retString, "text/html");
  
    return doc.getElementById(id);
   }

}//Player

function httpGet(theUrl){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
  xmlHttp.send( null );
  return xmlHttp.responseText;
}

function getCalendar(response){
      
      var separ1 = '<div class="col-lg-12 col-md-12 col-sm-12 col-xs-12">';
      var separ2 = '<hr class="ribbon"';
  
      var part1 = separ1 + response.split(separ1)[1];
      var htmlString = part1.split(separ2)[0] + separ2 + '/>';
  
  
      var parser = new DOMParser();
      var doc = parser.parseFromString(htmlString, "text/html");
  
      var teamsTag = doc.getElementsByClassName('team-name');
      var teams = [];
      for(var i=0; i<teamsTag.length; i++){
        var a = teamsTag[i].innerHTML;
        teams[i] = a;
      }
    return teams;
}

function tableCreate() {
  var body = document.getElementsByTagName('body')[0];
  var tbl = document.createElement('table');
  tbl.id = 'playerTable';
  tbl.setAttribute('border', '0');
    
  var tr = document.createElement('tr');
  
  var td = document.createElement('th');
  td.appendChild(document.createTextNode('Giocatore'))
  tr.appendChild(td)
  td = document.createElement('th');
  td.appendChild(document.createTextNode('FantaVoto'))
  tr.appendChild(td)
  td = document.createElement('th');
  td.appendChild(document.createTextNode('Prob %'))
  tr.appendChild(td)
  td = document.createElement('th');
  td.appendChild(document.createTextNode('Avversario'))
  tr.appendChild(td)
      
  tbl.appendChild(tr);
  
  body.appendChild(tbl)
}

function addRow(name, vote, prob, avv){
  name = lowerCaseAllWordsExceptFirstLetters(name);

  var table = document.getElementById('playerTable');
  
  var tr = document.createElement('tr');
  
  var td = document.createElement('td');
  td.appendChild(document.createTextNode(name));
  tr.appendChild(td);

  td = document.createElement('td');
  td.appendChild(document.createTextNode(vote));
  tr.appendChild(td);

  td = document.createElement('td');
  td.appendChild(document.createTextNode(prob));
  tr.appendChild(td);
      
  td = document.createElement('td');
  td.appendChild(document.createTextNode(avv || ''));
  tr.appendChild(td);

  table.appendChild(tr);

}

function sortRosa(rosa){
  rosa.sort(function(a, b) {
    return (b.fantavoto - a.fantavoto)
  });
}

function lowerCaseAllWordsExceptFirstLetters(string) {
  return string.replace(/\w\S*/g, function (word) {
      return word.charAt(0) + word.slice(1).toLowerCase();
  });
}

function doAll(){

  var probabilityHttpResponse = httpGet('https://www.fantagazzetta.com/probabili-formazioni-serie-a');

  
  var calendarHttpResponse = httpGet('https://www.fantagazzetta.com/serie-a/calendario/8');
  var calendar = getCalendar(calendarHttpResponse);

  var player0 = new Player("BUFFON", Juventus, "https://www.fantagazzetta.com/squadre/JUVENTUS/BUFFON/282/1/2017-18", probabilityHttpResponse, calendar);
  var player1 = new Player("SZCZESNY", Juventus, "https://www.fantagazzetta.com/squadre/JUVENTUS/SZCZESNY/453/1/2017-18", probabilityHttpResponse, calendar);
  var player2 = new Player("PINSOGLIO", Juventus, "https://www.fantagazzetta.com/squadre/JUVENTUS/PINSOGLIO/1930/1/2017-18", probabilityHttpResponse, calendar);
  
  tableCreate();
  
  var portieri = [player0,player1,player2];
  sortRosa(portieri);

  for (var i=0; i< portieri.length; i++)
    addRow(portieri[i].name, portieri[i].fantavoto, portieri[i].prob, portieri[i].avv);
     
  addRow('', '', '');
  addRow('', '', '');

  var player3 = new Player("BONUCCI", Milan, "https://www.fantagazzetta.com/squadre/MILAN/BONUCCI/286/1/2017-18", probabilityHttpResponse, calendar);
  var player4 = new Player("ASTORI", Fiorentina, "https://www.fantagazzetta.com/squadre/FIORENTINA/ASTORI/642/1/2017-18", probabilityHttpResponse, calendar);
  var player5 = new Player("MASIELLO A", Atalanta, "https://www.fantagazzetta.com/squadre/ATALANTA/MASIELLO-A/15/1/2017-18", probabilityHttpResponse, calendar);
  var player6 = new Player("ALBIOL", Napoli, "https://www.fantagazzetta.com/squadre/NAPOLI/ALBIOL/388/1/2017-18", probabilityHttpResponse, calendar);
  var player7 = new Player("ANDREOLLI", Cagliari, "https://www.fantagazzetta.com/squadre/CAGLIARI/ANDREOLLI/251/1/2017-18", probabilityHttpResponse, calendar);
  var player8 = new Player("HYSAJ", Napoli, "https://www.fantagazzetta.com/squadre/NAPOLI/HYSAJ/140/1/2017-18", probabilityHttpResponse, calendar);
  var player9 = new Player("BASTA", Lazio, "https://www.fantagazzetta.com/squadre/LAZIO/BASTA/319/1/2017-18", probabilityHttpResponse, calendar);
  var player10 = new Player("FERRARI G", Sampdoria, "https://www.fantagazzetta.com/squadre/SAMPDORIA/FERRARI-G/1895/1/2017-18", probabilityHttpResponse, calendar);
  
  var difensori = [player3,player4, player5, player6,player7,player8,player9,player10];
  sortRosa(difensori);

  for (var i=0; i< difensori.length; i++)
    addRow(difensori[i].name, difensori[i].fantavoto, difensori[i].prob, difensori[i].avv);
  
  addRow('', '', '');
  addRow('', '', '');
  
  var player11 = new Player("MILINKOVIC-SAVIC", Lazio, "https://www.fantagazzetta.com/squadre/LAZIO/MILINKOVIC-SAVIC/645/1/2017-18", probabilityHttpResponse, calendar);
  var player12 = new Player("DOUGLAS COSTA", Juventus, "https://www.fantagazzetta.com/squadre/JUVENTUS/DOUGLAS-COSTA/2200/1/2017-18", probabilityHttpResponse, calendar);
  var player13 = new Player("PEROTTI", Roma, "https://www.fantagazzetta.com/squadre/ROMA/PEROTTI/237/1/2017-18", probabilityHttpResponse, calendar);
  var player14 = new Player("VECINO", Inter, "https://www.fantagazzetta.com/squadre/INTER/VECINO/181/1/2017-18", probabilityHttpResponse, calendar);
  var player15 = new Player("BASELLI", Torino, "https://www.fantagazzetta.com/squadre/TORINO/BASELLI/556/1/2017-18", probabilityHttpResponse, calendar);
  var player16 = new Player("CICIRETTI", Benevento, "https://www.fantagazzetta.com/squadre/BENEVENTO/CICIRETTI/2243/1/2017-18", probabilityHttpResponse, calendar);
  var player17 = new Player("JOAO-MARIO", Inter, "https://www.fantagazzetta.com/squadre/INTER/JOAO-MARIO/2078/1/2017-18", probabilityHttpResponse, calendar);
  var player18 = new Player("RINCON", Torino, "https://www.fantagazzetta.com/squadre/TORINO/RINCON/238/1/2017-18", probabilityHttpResponse, calendar);

  var cc = [player11,player12, player13, player14,player15,player16,player17,player18];
  sortRosa(cc);

  for (var i=0; i< cc.length; i++)
    addRow(cc[i].name, cc[i].fantavoto, cc[i].prob, cc[i].avv);

  addRow('', '', '');
  addRow('', '', '');

  var player19 = new Player("BELOTTI", Torino, "https://www.fantagazzetta.com/squadre/TORINO/BELOTTI/441/1/2017-18", probabilityHttpResponse, calendar);
  var player20 = new Player("DZEKO", Roma, "https://www.fantagazzetta.com/squadre/ROMA/DZEKO/647/1/2017-18", probabilityHttpResponse, calendar);
  var player21 = new Player("BORRIELLO", SPAL, "https://www.fantagazzetta.com/squadre/SPAL/BORRIELLO/722/1/2017-18", probabilityHttpResponse, calendar);
  var player22 = new Player("LJAJIC", Torino, "https://www.fantagazzetta.com/squadre/TORINO/LJAJIC/478/1/2017-18", probabilityHttpResponse, calendar);
  var player23 = new Player("THEREAU", Fiorentina, "https://www.fantagazzetta.com/squadre/FIORENTINA/THEREAU/606/1/2017-18", probabilityHttpResponse, calendar);
  var player24 = new Player("LAPADULA", Genoa, "https://www.fantagazzetta.com/squadre/GENOA/LAPADULA/1939/1/2017-18", probabilityHttpResponse, calendar);
  
  var att = [player19,player20, player21, player22,player23,player24];
  sortRosa(att);

  for (var i=0; i< att.length; i++)
    addRow(att[i].name, att[i].fantavoto, att[i].prob, att[i].avv);
}
