/**
 * A more organic implementation of the Target Verse Display
 * Author: Luke Wilson
 */

const api = window.ModuleApi;
const React = api.React;
const ReactBootstrap = api.ReactBootstrap;

const Well = ReactBootstrap.Well;

class TargetVerseDisplay extends React.Component{
    constructor(){
        super();
        this.state = {
            selection: "",
            start: 0,
            end: 0
        }

        this.getSelectedWords = this.getSelectedWords.bind(this);
        this.textSelected = this.textSelected.bind(this);
        this.getWords = this.getWords.bind(this);
        this.clearSelection = this.getWords.bind(this);
    }

    componentWillMount(){
        this.getSelectedWords();
    }

    getSelectedWords(){
        var checkIndex = api.getDataFromCheckStore('TranslationWordsChecker', 'currentCheckIndex');
        var groupIndex = api.getDataFromCheckStore('TranslationWordsChecker', 'currentGroupIndex');
        if(checkIndex != null && groupIndex != null){
            var check = api.getDataFromCheckStore('TranslationWordsChecker', 'groups')[groupIndex].checks[checkIndex];
            if(check && check.selectionRange){
                this.setState({
                    start: check.selectionRange[0],
                    end: check.selectionRange[1]
                });
            }
        }
    }

    clearSelection(){
        this.setState({
            selection: "",
            start: 0,
            end: 0
        });
    }

    textSelected(selectionRelativity){

        //We reset the state here so that you cant highlight
        //something that is already highlighted (which caus
        //es a bug where the highlighted text renders twice)
        this.clearSelection();

        var text = "";
        var selection = window.getSelection();
        if(selection) {
            text = selection.toString();
        } else if(document.selection && document.selection.type != "Control") {
            text = document.selection.createRange().text;
        }

        var beginsAt = selection.getRangeAt(0).startOffset;
        var endsAt = selection.getRangeAt(0).endOffset;

        if(selectionRelativity == "post"){
            beginsAt += this.state.end;
            endsAt += this.state.end;
        }

        if(selectionRelativity == "in"){
          beginsAt = 0;
          endsAt = 0;
          selection = "";
        }

        this.setState({
            selection: text,
            start: beginsAt,
            end: endsAt
        });

        this.props.onWordSelected([text],[text],[beginsAt,endsAt]);
    }

    getWords(){
        //More refactoring could remove this method but we need it because it is reffed
        //by our View.js for the translation Words app
        return [this.state.selection];
    }

    getCurrentCheck() {
        var groups = api.getDataFromCheckStore('TranslationWordsChecker', 'groups');
        var currentGroupIndex = api.getDataFromCheckStore('TranslationWordsChecker', 'currentGroupIndex');
        var currentCheckIndex = api.getDataFromCheckStore('TranslationWordsChecker', 'currentCheckIndex');
        var currentCheck = groups[currentGroupIndex]['checks'][currentCheckIndex];
        return currentCheck;
    }

    getHighlightedWords(){
        let verse = this.props.verse
        let range = this.getCurrentCheck().selectionRange;
        if(range){
            let before = verse.substring(0, range[0]);
            let highlighted = verse.substring(range[0], range[1]);
            let after = verse.substring(range[1], verse.length);
            return(
                <div>
                    <span onMouseUp={() => this.textSelected("pre")}>
                        {before}
                    </span>
                    <span
                        style={{backgroundColor: 'yellow', fontWeight: 'bold'}}
                        onMouseUp = {() => this.textSelected("in")}
                        >
                        {highlighted}
                    </span>
                    <span onMouseUp={() => this.textSelected("post")}>
                        {after}
                    </span>
                </div>
            )
        }else{
            return(
                <div>
                    <span onMouseUp={() => this.textSelected()}>
                         {verse}
                    </span>
                </div>
            )
        }
    }

    render(){
        return (
            <div style={{
              padding: '9px',
              minHeight: '128px',
              direction: api.getDataFromCommon('params').direction == 'ltr' ? 'ltr' : 'rtl',
              width: '100%',
              marginBottom: '5px',
              WebkitUserSelect: 'text'
            }}>
                {/*This is the only way to use CSS psuedoclasses inline JSX*/}
                <style dangerouslySetInnerHTML={{
                    __html: [
                        '.highlighted::selection {',
                        '  background: yellow;',
                        '}'
                        ].join('\n')
                    }}>
                </style>
                <div className='highlighted'>
                    {this.getHighlightedWords()}
                </div>
            </div>
        )
    }

}

module.exports = TargetVerseDisplay;
