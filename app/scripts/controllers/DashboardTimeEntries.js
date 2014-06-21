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

/*globals $, _ */
'use strict';

angular.module('yoWorktajmApp')
  .controller('DashboardTimeEntriesCtrl', function ($scope, $rootScope, $resource, $controller, $filter, $q, $timeout, $modal, TimerService) {

    // Selected date
    $scope.date = new Date();
    $scope.selectedDate = new Date().toISOString().substring(0, 10);
    $scope.timeEntries = {};
    $scope.dateOptions = {
      'year-format': 'yy',
      'starting-day': 1
    };
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'shortDate'];
    $scope.format = $scope.formats[0];    
    $scope.showTimeEntryForm = false;

    // Load time entries from service
    TimerService.getTimeEntries();

    // User clicks remove button
    $scope.removeTimeEntry = function (timeEntry) {
      TimerService.removeTimeEntry(timeEntry);
    };


    // This is called after user has modefied the time entry.
    $scope.updateTimeEntryOnOk = function (timeEntry) {
      console.log('DashboardTimeEntriesCtrl::updateTimeEntryOnOk');
      if (timeEntry) {
        console.log('DashboardTimeEntriesCtrl::updateTimeEntryOnOk - [%s] [%s] [%d]', 
                    timeEntry.startTime, 
                    timeEntry.endTime,
                    timeEntry.project.id);
        if (timeEntry.project.id) {
          console.log('Project exists for time entry');
          if (timeEntry.id) {
            TimerService.updateTimeEntry(timeEntry).then(function (newTimeEntry) {
              // Event will be triggered
            });            
          } else {
            TimerService.createTimeEntry(timeEntry).then(function (newTimeEntry) {
              $scope.timeEntries.push(newTimeEntry);
            });            
          }
        } else {
          // New projects must be created first
          console.log('New project defined, creating project first');
          TimerService.updateProject(_.omit(timeEntry.project, 'id')).then(function (project) {
            console.log('Project created at backend, now creating the time entry');
            timeEntry.project = project;
            TimerService.createTimeEntry(timeEntry).then(function (newTimeEntry) {
              $scope.timeEntries.push(newTimeEntry);
            });
          });
        }
      } else {
        console.log('DashboardTimeEntriesCtrl::updateTimeEntryOnOk - TimeEntry null');
      }
    };

    $scope.updateTimeEntryOnCancel = function (reason) {
      console.log('Pressed cancel %s', reason);
    };

    // User clicks the add new time entry button    
    $scope.createTimeEntry = function () {
      console.log('DashboardTimeEntriesCtrl::createTimeEntry');
      var timeEntry = {
        startTime: null,
        endTime: null,
        project: null
      };
      $scope.openTimeEntryModal({
        titleText: 'Create Time Entry',
        okText: 'Create'
      }, timeEntry);
    };

    $scope.editTimeEntry = function (timeEntry) {
      console.log('DashboardTimeEntriesCtrl::editTimeEntry - timeEntry.id %d', timeEntry.id);
      $scope.openTimeEntryModal({
        titleText: 'Edit  Time Entry',
        okText: 'Update'
      }, timeEntry);
    };

    $scope.openTimeEntryModal = function (params, timeEntry) {
      var modalParams = {
        titleText: 'Edit Time Entry',
        messageText: 'dsfsdf',
        okText: 'Update',
        cancelText: 'Cancel',
        timeEntry: timeEntry
      };
      _.extend(modalParams, params);
      var modalInstance = $modal.open({
        templateUrl: 'timeEntryModal.html',
        controller: 'TimeEntryModalCtrl',
        resolve: {
          modalParams: function () {
            return modalParams;
          }
        }
      });

      modalInstance.result.then(
        $scope.updateTimeEntryOnOk,
        $scope.updateTimeEntryOnCancel);      
    };

    // Utility function to find the object being displayed in the controller
    $scope.findTimeEntryById = function (id) {
      var item;
      if ($scope.timeEntries) {
        item = $.grep($scope.timeEntries, function (e) { return e.id === id; })[0];
      }
      return item;
    };

    // Utility function to display the end time nicely
    $scope.getEndTime = function (timeEntry) {
      var result = 'Running';
      if (timeEntry.endTime !== null) {
        result = $filter('date')(timeEntry.endTime, 'HH:mm:ss');
      }
      return result;
    };

    // Utility function to show duration for a task
    $scope.getDuration = function (timeEntry) {
      var result = 'f';
      if (timeEntry.endTime) {
        var elapsedSeconds = (timeEntry.endTime - timeEntry.startTime)/1000;
        var hours   = Math.floor(elapsedSeconds / 3600);
        var minutes = Math.floor((elapsedSeconds - (hours * 3600)) / 60);
        var seconds = elapsedSeconds - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = '0' + hours;}
        if (minutes < 10) {minutes = '0' + minutes;}
        if (seconds < 10) {seconds = '0' + seconds;}
        result = hours + ':' + minutes;
      }
      return result;
    };

    //
    // Service events
    //
    $scope.$on('onTimeEntriesRefreshed', function (event, newTimeEntries) {
      console.log('EVENT: DashboardTimeEntriesCtrl::onTimeEntriesRefreshed(count [%d])', newTimeEntries.length);
      $scope.timeEntries = newTimeEntries;
    });
    $scope.$on('onProjectUpdated', function (event, updatedProject) {
      console.log('EVENT: DashboardTimeEntriesCtrl::onProjectUpdated(id [%d])', updatedProject.id);
      _.each($scope.timeEntries, function (entry) {
        if (entry.project.id === updatedProject.id) {
          _.extend(entry.project, _.pick(updatedProject, 'name'));
        }
      });
    });
    $scope.$on('onLoggedOut', function () {
      console.info('EVENT: DashboardTimeEntriesCtrl::onLoggedOut()');
      $scope.timeEntries = null;
    });    

  });
