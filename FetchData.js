import scripturePaneData from '../ScripturePane/FetchData';
import tWFetchData from './tWFetchData'
const TOTAL_FETCH_DATAS = 2;
var FETCH_DATAS_FINISHED = 0;

export default function fetchAllData(props) {
  const projectDetails = props.projectDetailsReducer;
  const bibles = props.resourcesReducer.bibles;
  const actions = props.actions;
  const totalProgress = actions.progress;

  return new Promise(function(resolve, reject) {
    scripturePaneData(projectDetails, bibles, actions, progress)
    .then(()=>{
      FETCH_DATAS_FINISHED++;
      tWFetchData(projectDetails, bibles, actions, progress);
    })
    .then(resolve);
  })

  function progress(value) {
    totalProgress(value / (TOTAL_FETCH_DATAS - FETCH_DATAS_FINISHED));
  }
}
