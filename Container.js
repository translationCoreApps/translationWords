//Api Consts
const api = window.ModuleApi;
const React = require('react');
//Modules that are defined within translationNotes_Check_plugin
const View = require('./View.js');
//String constants
const NAMESPACE = "ImportantWords",
      UNABLE_TO_FIND_ITEM_IN_STORE = "Unable to find key in namespace",
      UNABLE_TO_FIND_WORD = "Unable to find wordobject";

class Container extends React.Component {
  constructor() {
    super();
    this.state = {
      currentFile: null,
      tabKey: 1,
      showHelps: true
    }
    this.saveProjectAndTimestamp = this.saveProjectAndTimestamp.bind(this);
    this.onCurrentCheckChange = this.onCurrentCheckChange.bind(this);
  }

  componentWillMount(){
    this.addTargetLanguageToChecks();
    let checkStatus = this.props.currentCheck.checkStatus;
    this.currentCheck = this.props.currentCheck;
    if(checkStatus === "FLAGGED"){
      this.setState({tabKey: 2});
    }else {
      this.setState({tabKey: 1});
    }
  }

  componentWillReceiveProps(nextProps) {
    let checkStatus = nextProps.currentCheck.checkStatus;
    nextProps.currentCheck.isCurrentItem = true;
    if (JSON.stringify(this.currentCheck) === JSON.stringify(nextProps.currentCheck)) {
      return;
    } else {
      this.currentCheck = nextProps.currentCheck;
    }
    if(checkStatus === "FLAGGED"){
      this.setState({tabKey: 2});
    }else {
      this.setState({tabKey: 1});
    }
  }

  addTargetLanguageToChecks() {
    let groups = this.props.groups;
    var targetLanguage = api.getDataFromCommon('targetLanguage');
    for (var group in groups) {
      for (var item in groups[group].checks) {
        var co = groups[group].checks[item];
        try {
          var targetAtVerse = targetLanguage[co.chapter][co.verse];
          groups[group].checks[item].targetLanguage = targetAtVerse;
        } catch (err) {
          //Happens with incomplete books.
        }
      }
    }
    api.putDataInCheckStore(NAMESPACE, 'groups', groups);
  }

  saveProjectAndTimestamp(){
    let { currentCheck, userdata, currentGroupIndex, currentCheckIndex} = this.props;
    let currentUser;
    if(userdata){
      currentUser = userdata.username;
    }else {
      currentUser = "unknown";
    }
    let timestamp = new Date();
    currentCheck.user = currentUser;
    currentCheck.timestamp = timestamp;
    var commitMessage = 'user: ' + currentUser + ', namespace: ' + NAMESPACE +
      ', group: ' + currentGroupIndex + ', check: ' + currentCheckIndex;
    this.props.updateCurrentCheck(NAMESPACE, currentCheck);
    api.saveProject(commitMessage);
  }

  /**
   * @description - updates the status of the current check in the
   * checkStoreReducer
   * @param {object} newCheckStatus - the new check status for the check
   */
  updateCheckStatus(newCheckStatus) {
    let { currentCheck, currentGroupIndex, currentCheckIndex } = this.props;
    if (currentCheck.checkStatus) {
      if(currentCheck.checkStatus === newCheckStatus){
        currentCheck.checkStatus = "UNCHECKED";
        newCheckStatus = "UNCHECKED";
      }else {
        currentCheck.checkStatus = newCheckStatus;
      }
      api.emitEvent('changedCheckStatus', {
        groupIndex: currentGroupIndex,
        checkIndex: currentCheckIndex,
        checkStatus: newCheckStatus,
      });
      this.props.updateCurrentCheck(NAMESPACE, currentCheck);
      this.saveProjectAndTimestamp();
    }
    api.Toast.info('Current check was marked as:', newCheckStatus, 2);
    this.handleSelectTab(2);
  }

  updateSelectedWords(wordObj, remove) {
    let currentCheck = this.props.currentCheck;
    if(remove){
      this.removeFromSelectedWords(wordObj, currentCheck);
    }else{
      this.addSelectedWord(wordObj, currentCheck);
    }
  }

  addSelectedWord(wordObj, currentCheck){
    let idFound = false;
    if(currentCheck.selectedWordsRaw.length > 0){
      for (var i in currentCheck.selectedWordsRaw) {
        if (currentCheck.selectedWordsRaw[i].key == wordObj.key) {
          idFound = true;
        }
      }
      if (!idFound) {
        currentCheck.selectedWordsRaw.push(wordObj);
        this.sortSelectedWords(currentCheck.selectedWordsRaw);
      }
    }else{
      currentCheck.selectedWordsRaw.push(wordObj);
    }
    this.props.updateCurrentCheck(NAMESPACE, currentCheck);
    this.saveProjectAndTimestamp();
  }

  removeFromSelectedWords(wordObj, currentCheck) {
    let index = -1;
    if(currentCheck.selectedWordsRaw){
      for (var i in currentCheck.selectedWordsRaw) {
        if (currentCheck.selectedWordsRaw[i].key == wordObj.key) {
          index = i;
        }
      }
      if (index != -1) {
        currentCheck.selectedWordsRaw.splice(index, 1);
      }
    }
    this.props.updateCurrentCheck(NAMESPACE, currentCheck);
    this.saveProjectAndTimestamp();
  }

  sortSelectedWords(selectedWords) {
    selectedWords.sort(function(first, next) {
      return first.key - next.key;
    });
  }

  getVerse(language) {
    var currentCheck = this.props.currentCheck;
    var currentVerseNumber = currentCheck.verse;
    var verseEnd = currentCheck.verseEnd || currentVerseNumber;
    var currentChapterNumber = currentCheck.chapter;
    var desiredLanguage = api.getDataFromCommon(language);
    try {
      if (desiredLanguage) {
        let verse = "";
        for (let v = currentVerseNumber; v <= verseEnd; v++) {
          verse += (desiredLanguage[currentChapterNumber][v] + " \n ");
        }
        return verse;
      }
    }
    catch (e) {
    }
  }

  goToPrevious() {
    this.props.handleGoToPrevious(NAMESPACE);
  }

  goToNext() {
    this.props.handleGoToNext(NAMESPACE);
  }

  handleSelectTab(tabKey){
     this.setState({tabKey});
  }

  onCurrentCheckChange(newCurrentCheck, proposedChangesField){
    let currentCheck = this.props.currentCheck;
    currentCheck.proposedChanges = newCurrentCheck.proposedChanges;
    currentCheck.comment = newCurrentCheck.comment;
    if(proposedChangesField){
      currentCheck[proposedChangesField] = newCurrentCheck[proposedChangesField];
    }
    this.currentCheck = currentCheck;
    this.props.updateCurrentCheck(NAMESPACE, currentCheck);
    this.saveProjectAndTimestamp();
  }

  toggleHelps(){
    this.setState({showHelps: !this.state.showHelps});
  }

  render(){
    let dragToSelect = false;
    if(this.props.currentSettings.textSelect === 'drag'){
      dragToSelect = true;
    }
    let proposedChangesStore = api.getDataFromCheckStore('ProposedChanges');
    let commentBoxStore = api.getDataFromCheckStore('CommentBox');
    let direction = api.getDataFromCommon('params').direction == 'ltr' ? 'ltr' : 'rtl';
    let gatewayVerse = '';
    let targetVerse = '';
    if(this.props.currentCheck){
      gatewayVerse = this.getVerse('gatewayLanguage');
      targetVerse = this.getVerse('targetLanguage');
    }
    var currentWord = this.props.groups[this.props.currentGroupIndex].group;
    var wordObject;
    let currentFile = '';
    var wordList = api.getDataFromCheckStore('TranslationHelps', 'wordList');
    if (wordList && currentWord) {
      wordObject = search(wordList, function(item) {
          return stringCompare(currentWord,item.name);
      });
    }
    try{
      currentFile = wordObject.file;
    }catch(e){
    }
    return (
      <View
        {...this.props}
        currentCheck={this.props.currentCheck}
        updateCurrentCheck={(newCurrentCheck, proposedChangesField) => {
          this.onCurrentCheckChange(newCurrentCheck, proposedChangesField)
        }}
        bookName={this.props.book}
        currentFile={currentFile}
        gatewayVerse={gatewayVerse}
        targetVerse={targetVerse}
        dragToSelect={dragToSelect}
        direction={direction}
        tabKey={this.state.tabKey}
        commentBoxStore={commentBoxStore}
        proposedChangesStore={proposedChangesStore}
        updateSelectedWords={this.updateSelectedWords.bind(this)}
        updateCheckStatus={this.updateCheckStatus.bind(this)}
        handleSelectTab={this.handleSelectTab.bind(this)}
        goToPrevious={this.goToPrevious.bind(this)}
        goToNext={this.goToNext.bind(this)}
        showHelps={this.state.showHelps}
        toggleHelps={this.toggleHelps.bind(this)}
      />
    );
  }
}



  /**
  * Compares two string alphabetically
  * @param {string} first - string to be compared against
  * @param {string} second - string to be compared with
  */
  function stringCompare(first, second) {
    if (first < second) {
      return -1;
    }
    else if (first > second) {
      return 1;
    }
  else {
      return 0;
    }
  }

  /**
  * @description - Binary search of the list. I couldn't find this in the native methods of an array so
  * I wrote it
  * @param {array} list - array of items to be searched
  * @param {function} boolFunction - returns # < 0, # > 0. or 0 depending on which path the
  * search should take
  * @param {int} first - beginnging of the current partition of the list
  * @param {int} second - end of the current partition of the list
  */
  function search(list, boolFunction, first = 0, last = -1) {
    if (last == -1) {
      last = list.length;
    }
    if (first > last) {
      return;
    }
    var mid = Math.floor(((first - last) * 0.5)) + last;
    var result = boolFunction(list[mid]);
    if (result < 0) {
      return search(list, boolFunction, first, mid - 1);
    }
    else if (result > 0) {
      return search(list, boolFunction, mid + 1, last);
    }
  else {
      return list[mid];
    }
  }


module.exports = {
  name: NAMESPACE,
  container: Container
}
