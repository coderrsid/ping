import React from 'react';
import usePushNotifications from "./usePushNotifications";

function withMyHook(Account) {
    return function WrappedComponent(props) {
      const {
			  onClickAskUserPermission,
		  } = usePushNotifications();
      return <Account {...props} onClickUserPermission={onClickAskUserPermission} />;
    }
}

export default withMyHook;