import React from 'react';
import View from './View.js';
// Constant declarations
const NAMESPACE = "translationWords";

class Container extends React.Component {
  constructor() {
    super();
    this.state = {
      showHelps: true
    };
  }

  componentWillMount() {
    let { ScripturePane } = this.props.settingsReducer.toolsSettings;
    if (!ScripturePane) {
      // initializing the ScripturePane settings if not found.
      this.props.actions.setToolSettings("ScripturePane", "currentPaneSettings", ["ulb"]);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.contextIdReducer && this.props.contextIdReducer !== nextProps.contextIdReducer) {
      let articleId = nextProps.contextIdReducer.contextId.groupId;
      nextProps.actions.loadResourceArticle('translationWords', articleId);
    }
  }

  toggleHelps() {
    this.setState({ showHelps: !this.state.showHelps });
  }

  render() {
    let view = <div />;
    let { contextId } = this.props.contextIdReducer;
    if (contextId !== null) {
      view = <View
        {...this.props}
        showHelps={this.state.showHelps}
        toggleHelps={this.toggleHelps.bind(this)}
      />
    }
    return view;
  }
}

module.exports = {
  name: NAMESPACE,
  container: Container
};
