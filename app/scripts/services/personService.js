/*
  @licstart The following is the entire license notice for the 
            JavaScript code in this page.
  @source https://github.com/hirro/yo-worktajm

  Copyright (C) 2013 Jim Arnell.

  The JavaScript code in this page is free software: you can
  redistribute it and/or modify it under the terms of the GNU
  General Public License (GNU GPL) as published by the Free Software
  Foundation, either version 3 of the License, or (at your option)
  any later version.  The code is distributed WITHOUT ANY WARRANTY;
  without even the implied warranty of MERCHANTABILITY or FITNESS
  FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

  As additional permission under GNU GPL version 3 section 7, you
  may distribute non-source (e.g., minimized or compacted) forms of
  that code without the copy of the GNU GPL normally required by
  section 4, provided you include this license notice and a URL
  through which recipients can access the Corresponding Source.

  @licend The above is the entire license notice
          for the JavaScript code in this page.  
*/

/* globals Base64 */

'use strict';

/**
 * This service handle operations for the currently logged in user.
 * @event onProjectUpdated(project) when active project has changed.
 * @tbdEvent onLoggedOut()
 * @tbdEvent onLoggedIn()
 */
angular.module('yoWorktajmApp').service('PersonService', function PersonService($rootScope, $cookieStore, $q, Restangular) {
  var personService = {
    person: null,
    token:  null,
    personId: 0
  };

  /**
   * Returns the logged in person.
   * If person has not been loaded before it will be retrieved from backend.
   * @return promise to Person.
   */
  personService.getPerson = function () {
    var deferred = $q.defer();

    if (personService.person) {
      console.log('PersonService:getPerson - OK (cached)');
      deferred.resolve(personService.person);
    } else {
      var qPerson = Restangular.one('person', personService.personId).get();
      qPerson.then(function (p) {
        console.log('PersonService:getPerson - OK (remote)');
        personService.person = p;
        return deferred.resolve(p);
      }, function () {
        var msg = 'Failed to load the person from backend';
        console.error('PersonService:getPerson - %s', msg);
        return deferred.reject(msg);
      });
    }
    return deferred.promise;        
  };

  /**
   * Sets the logged in person as actively running the provided time entry.
   * @return promise to the person.
   */
  personService.setActiveTimeEntry = function (timeEntry) {
    var deferred = $q.defer();
    console.log('PersonService:setActiveTimeEntry(id [%d])', timeEntry ? timeEntry.id : null);
    var stoppedProject = personService.person.activeTimeEntry ? personService.person.activeTimeEntry.project : null;
    var startedProject = timeEntry ? timeEntry.project : null;
    personService.person.activeTimeEntry = timeEntry;
    personService.person.put().then(function (result) {
      // Signal that the project status has changed.
      if (stoppedProject) {
        stoppedProject.active = false;
        console.log('BROADCAST: onProjectUpdated (id [%d])', stoppedProject.id);
        $rootScope.$broadcast('onProjectUpdated', stoppedProject);
      } else {
        console.log('PersonService:::setActiveTimeEntry - No project stopped');
      }
      if (startedProject) {
        console.log('BROADCAST: onProjectUpdated (id [%d])', startedProject.id);
        startedProject.active = true;
        $rootScope.$broadcast('onProjectUpdated', startedProject);
      } else {
        console.log('PersonService:::setActiveTimeEntry - No project started');
      }
      return deferred.resolve(result);
    }, function (reason) {
      console.error('PersonService::setActiveTimeEntry failed. %s', reason);
      return deferred.reject(reason);
    });
    return deferred.promise;
  };

  /**
   * Returns the active time entry of the logged in person.
   * @return active time entry of logged in person, null if not active.
   */
  personService.getActiveTimeEntry = function () {
    var timeEntry = null;
    if (personService.person && personService.person.activeTimeEntry) {
      timeEntry = personService.person.activeTimeEntry;
    }
    return timeEntry;
  };

  /** Returns the id if the active project.
   * @return id of the active project, -1 if no project is active.
   */
  personService.getActiveProjectId = function () {
    var result = -1;
    if (personService.person &&
        personService.person.activeTimeEntry &&
        personService.person.activeTimeEntry.project) {
      console.log('PersonService::getActiveProjectId(id [%d])', personService.person.activeTimeEntry.project.id);
      result = personService.person.activeTimeEntry.project.id;
    } else {
      console.log('PersonService::getActiveProjectId - No active project');
    }
    return result;
  };

  personService.login = function (username, password) {
    console.log('PersonService::login(%s, *****)', username);
    var deferred = $q.defer();
    personService.setCredentials(username, password);
    Restangular.one('authenticate').get().then(function (result) {
      console.log('Successfully logged in user [%s]', username);
      personService.person = result;
      return deferred.resolve(result);
    }, function (reason) {
      console.log('Failed to login used [%s], reason: [%s]', username, reason);
      return deferred.reject(reason);      
    });
    return deferred.promise;    
  };

  personService.logout = function () {
    console.log('PersonService::logout()');
    personService.clearCredentials();
  };

  personService.setCredentials = function (username, password) {
    personService.credentials = Base64.encode(username + ':' + password);
    $cookieStore.put('authentication', personService.credentials);

    // Use the token to set the authentication token, once done the person can be fetched.
    Restangular.setDefaultHeaders({
      'Authorization': 'Basic ' + personService.credentials
    });

    console.log('PersonService::setCredentials(%s)', personService.credentials);
  };

  personService.clearCredentials = function () {
    document.execCommand('ClearAuthenticationCache');
    $cookieStore.remove('authentication');
    Restangular.setDefaultHeaders({
      'Authorization': ''
    });
    personService.credentials = undefined;
  };

  personService.getPrincipal = function () {
    return personService.person;
  };  

  return personService;
});
