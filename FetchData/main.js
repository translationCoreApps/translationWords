import scripturePaneData from './ScripturePane';
import tWFetchData from './TranslationWords'

export default function fetchAllData(props) {
  const projectDetails = props.projectDetailsReducer;
  const bibles = props.resourcesReducer.bibles;
  const actions = props.actions;
  const totalProgress = actions.progress;
  const scripturePaneSettings = props.modulesSettingsReducer.ScripturePane;
  const groupsDataLoaded = props.groupsDataReducer.loadedFromFileSystem;
  const groupsIndexLoaded = props.groupsIndexReducer.loadedFromFileSystem;

  return new Promise(function(resolve, reject) {
    scripturePaneData(projectDetails, bibles, actions, totalProgress, scripturePaneSettings)
    .then(() => {
      tWFetchData(projectDetails, bibles, actions, totalProgress, groupsIndexLoaded, groupsDataLoaded);
    })
    .then(resolve).catch(e => {
      console.warn(e);
    });
  });
}
