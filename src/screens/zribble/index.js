import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import { sendMessage, turnOffVoice, turnOnVoice } from '../../actions/room';
import { Zribble } from './zribble';

function mapStateToProps(state) {
  return {
    messages: state.chat.messages
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      {
        sendMessage,
        turnOnVoice,
        turnOffVoice
      },
      dispatch,
    ),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Zribble);
