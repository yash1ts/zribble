import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { newRoom } from '../../actions/room';
import { Main } from './main';

function mapStateToProps(state) {
  
  return {
    roomId: state.room.id
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        newRoom
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Main);
