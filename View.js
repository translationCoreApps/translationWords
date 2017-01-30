/**
 * @description:
 *  This class defines the entire view for TranslationWords tool
 */
//Api Consts
const api = window.ModuleApi;
const React = api.React;
const RB = api.ReactBootstrap;
//Bootstrap consts
const {Row, Col, Tabs, Tab, Glyphicon} = RB;
//Modules not defined within TranslationWords
let ScripturePane = null;
let ProposedChanges = null;
let CommentBox = null;
let TranslationHelps = null;
//Components
const DragTargetVerseDisplay = require('./components/BareTargetVerseDisplay.js');
const ClickTargetVerseDisplay = require('./components/TargetVerseDisplay');
const GatewayVerseDisplay = require('./components/GatewayVerseDisplay.js');
const CheckStatusButtons = require('./components/CheckStatusButtons');
const HelpInfo = require('./components/HelpInfo');
const style = require('./css/style');


class View extends React.Component {
  constructor(){
    super();
    ScripturePane = api.getModule('ScripturePane');
    ProposedChanges = api.getModule('ProposedChanges');
    CommentBox = api.getModule('CommentBox');
    TranslationHelps = api.getModule('TranslationHelps');
  }
  render(){
    let TargetVerseDisplay = null;
    if(this.props.dragToSelect){
      TargetVerseDisplay = <DragTargetVerseDisplay
                              verse={this.props.targetVerse}
                              onWordSelected={this.props.updateSelectedWords.bind(this)}
                              style={style.targetVerse}
                              currentCheck={this.props.currentCheck}
                              direction={this.props.direction}
                              bookName={this.props.bookName}
                            />
    }else {
      TargetVerseDisplay = <ClickTargetVerseDisplay
                              verse={this.props.targetVerse}
                              updateSelectedWords={this.props.updateSelectedWords.bind(this)}
                              style={style.targetVerse}
                              currentCheck={this.props.currentCheck}
                              direction={this.props.direction}
                              bookName={this.props.bookName}
                            />
    }
    let toolGlyph = <img src="images/tWIcon.png" style={{height: "25px"}}/>;
    let proposedChangesGlyph = <Glyphicon glyph="pencil" style={{color: "#FFFFFF", fontSize: "20px"}} />;
    let commentGlyph = <Glyphicon glyph="comment" style={{color: "#FFFFFF", fontSize: "20px"}} />;
    let questionGlyph = <Glyphicon glyph="question-sign" style={{color: "#FFFFFF", fontSize: "20px"}} />;
    return (
      <div>
        <ScripturePane currentCheck={this.props.currentCheck} />
        <Row className="show-grid" style={{marginTop: '0px', bottom: "0px",  height: "calc(100vh - 256px)", backgroundColor: "#333333"}}>
          <Col sm={12} md={6} lg={8} style={{height: "100%", padding: '0px',
           borderLeft: "20px solid #0277BD", borderTop: "20px solid #0277BD", borderRight: "20px solid #0277BD"}}>
            <div style={{padding: '10px', display: "flex", backgroundColor: "#FFFFFF"}}>
              <div style={{padding: '0px', display: "box"}}>
                <h4>Target Language</h4>
                {TargetVerseDisplay}
              </div>
              <CheckStatusButtons updateCheckStatus={this.props.updateCheckStatus.bind(this)}
                                  currentCheck={this.props.currentCheck}
                                  goToNext={this.props.goToNext}
                                  goToPrevious={this.props.goToPrevious}
              />
            </div>
              <Tabs activeKey={this.props.tabKey}
                    onSelect={e => this.props.handleSelectTab(e)}
                    id="controlled-tab-example"
                    bsClass="newTabs"
                    style={{backgroundColor: "#FFFFFF", width: "100%"}}>
                <Tab eventKey={1} title={toolGlyph}
                                  style={style.tabStyling}>
                  <div style={{height: "100%", backgroundColor: "#333333", boxSizing: "border-box"}}>
                    <div style={style.currentWord}>
                      <h4 style={{color: "#FFFFFF"}}>translationWords</h4><br />
                      {'"' + this.props.currentCheck.groupName + '"'}
                    </div>
                  </div>
                </Tab>
                <Tab eventKey={2} title={proposedChangesGlyph}
                                  style={style.tabStyling}>
                  <div style={{height: "100%", backgroundColor: "#333333", boxSizing: "border-box"}}>
                    <ProposedChanges currentCheck={this.props.currentCheck}
                                     updateCurrentCheck={this.props.updateCurrentCheck.bind(this)}
                                     proposedChangesStore={this.props.proposedChangesStore} />
                  </div>
                </Tab>
                <Tab eventKey={3} title={commentGlyph}
                                  style={style.tabStyling}>
                  <div style={{height: "calc(100vh - 511px)", backgroundColor: "#333333", boxSizing: "border-box"}}>
                    <CommentBox currentCheck={this.props.currentCheck}
                                updateCurrentCheck={this.props.updateCurrentCheck.bind(this)}
                                commentBoxStore={this.props.commentBoxStore} />
                  </div>
                </Tab>
                <Tab eventKey={4} title={questionGlyph}
                                      style={style.tabStyling}>
                  <div style={{height: "100%", backgroundColor: "#333333", boxSizing: "border-box"}}>
                    <HelpInfo />
                  </div>
                </Tab>
              </Tabs>
            </Col>
          <Col sm={12} md={6} lg={4} style={{padding: "0px"}}>
            <div style={{height: "calc(100vh - 256px)"}}>
              <TranslationHelps currentFile={this.props.currentFile} />
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

module.exports = View;
