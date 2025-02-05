import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../contexte/ContexteAuth';

const RoutePrivee = ({ children, ...rest }) => {
  const { utilisateur } = useAuth();

  return (
    <Route
      {...rest}
      render={({ location }) =>
        utilisateur ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

export default RoutePrivee;
