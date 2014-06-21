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

/*globals _ */

'use strict';

angular.module('yoWorktajmApp')
  .filter('timeEntryFilter', function () {
    return function (timeEntries, selection) {

      // Filter by date
      var filteredByTime = _.filter(timeEntries, function (timeEntry) {
        return (timeEntry.startTime >= selection.from) && (timeEntry.startTime <= selection.to);
      });

      // Filter by customer
      var filteredByCustomer = filteredByTime;
      if (selection.customer !== 0) {
        filteredByCustomer = _.filter(filteredByTime, function (timeEntry) {
          return timeEntry.project.customerId === selection.customer;
        });
      }
      
      // Filter by projects
      var enabledProjectsIds = _.pluck(
        _.filter(selection.projects, function (p) {
          return p.enabled;
        }),
        'id');
      var filteredByProjects = _.filter(filteredByCustomer, function (timeEntry) {        
        return _.contains(enabledProjectsIds, timeEntry.project.id);
      });

      return filteredByProjects;

    };
  });
