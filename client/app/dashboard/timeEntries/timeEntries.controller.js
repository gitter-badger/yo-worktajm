/*globals console, moment */

'use strict';

angular.module('worktajmApp')
  .controller('TimeentriesCtrl', function ($scope, $modal, Worktajm) {

    $scope.timeEntries = [];
    $scope.projects = [];
    $scope.projectsIndexedById = [];
    $scope.projectNames = [];
    $scope.datePickerOpened = false;
    $scope.dateFormat = 'yyyy-MM-dd';
    $scope.selected = {
      selectedDate: moment().utc().format(),
      day: false,
      week: false,
      month: false,
      viewMode: 'Day'
    };


    Worktajm.loadCurrentUser().then(function (result) {
      $scope.currentUser = result;
    });

    $scope.load = function () {
      console.log('load');

      // Start download of objects from BE
      Worktajm.loadProjects();
      Worktajm.loadTimeEntries();

      // The references will be updated
      $scope.projects = Worktajm.getProjects();
      $scope.projectsIndexedById = Worktajm.getProjectsIndexedById();
      $scope.timeEntries = Worktajm.getTimeEntries();
      $scope.projectNames = Worktajm.getProjectNames();
    };

    $scope.load();

    // Modal controller
    var TimeEntryModalCtrl = function ($scope, $modalInstance, modalParams) {
      _.extend($scope, modalParams);
      $scope.timeEntry = _.clone(modalParams.timeEntry);
      var startTime = moment(modalParams.timeEntry.startTime);
      var endTime = moment(modalParams.timeEntry.endTime);
      $scope.modalParams = {
        'project': modalParams.timeEntry.project,
        'startDate': startTime,
        'startTime': startTime.format('HH:mm:ss'),
        'endDate': endTime,
        'endTime': endTime.format('HH:mm:ss')
      };

      $scope.ok = function () {
        // FIXME
        // Make sure timeEntry name is unique for the logged in person.
        // If not, set the error status on the input
        //$scope.timeEntryForm.timeEntry.$setValidity('uniqueTimeEntryPerUser', false);
        console.log($scope.modalParams);
        $modalInstance.close($scope.timeEntry);
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };

      $scope.updateStartDate = function (a) {
        modalParams.startDate = moment(a);
      };

      $scope.updateEndDate = function (a) {
        modalParams.endDate = moment(a);
      };

    };

    $scope.createTimeEntry = function () {
      console.log('createTimeEntry');
    };

    $scope.editTimeEntry = function () {
      console.log('editTimeEntry');
    };

    $scope.deleteTimeEntry = function (timeEntry) {
      console.log('deleteTimeEntry');
      Worktajm.deleteTimeEntry(timeEntry);
    };

    // Modal functions
    $scope.openModal = function (timeEntry, titleText, messageText, okText, cancelText) {
      console.log('TimeEntriesCtrl::openModal', timeEntry._id);
      console.log(timeEntry);
      var modalParams = {
        timeEntry: timeEntry,
        titleText: titleText,
        messageText: messageText,
        okText: okText,
        cancelText: cancelText,
        subject: _.clone(timeEntry)
      };
      var modalInstance = $modal.open({
        templateUrl: 'app/dashboard/timeEntries/timeEntryModal.html',
        controller: TimeEntryModalCtrl,
        resolve: {
          modalParams: function () {
            return modalParams;
          }
        }
      });
      modalInstance.result.then($scope.onUpdateTimeEntry);
    };

    $scope.editTimeEntry = function (timeEntry) {
      console.log('TimeEntries::editTimeEntry, timeEntryName: %s', timeEntry._id);
      $scope.openModal(timeEntry, 'Update TimeEntry', '', 'Update', 'Cancel');
    };

    $scope.createTimeEntry = function () {
      var timeEntry = { name: ''};
      $scope.openModal(timeEntry, 'Create TimeEntry', '', 'Create', 'Cancel');
    };

    $scope.getProjectNameForTimeEntry = function (timeEntry) {
      var project = $scope.projects[timeEntry.projectId];
      return project ? project.name : '';
    };

    $scope.onUpdateTimeEntry = function (timeEntry) {
      if (timeEntry._id) {
        console.log('onUpdateTimeEntry - updating [%s]', timeEntry);

        // Extend existing entry
        var existingTimeEntry = _.find($scope.timeEntries, { '_id': timeEntry._id });
        _.extend(existingTimeEntry, timeEntry);
        Worktajm.updateTimeEntry(existingTimeEntry);
      } else {
        console.log('onUpdateTimeEntry - creating [%s]', timeEntry);
        Worktajm.createTimeEntry(timeEntry);
      }
    };

    // Date selector
    $scope.openDatePicker = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.datePickerOpened = true;
    };

    $scope.duration = function (timeEntry) {
      var endTime = moment(timeEntry.endTime);
      var startTime = moment(timeEntry.startTime);
      // console.log('startTime', startTime.format());
      // console.log('endtime', endTime.format());
      var ms = endTime.diff(startTime);
      var d = moment.duration(ms);
      var s = Math.floor(d.asHours()) + moment.utc(ms).format(':mm:ss');
      // console.log('ms:', ms);
      // console.log('duration:', d);
      return s;
    };

    $scope.isActive = function (timeEntry) {
      return $scope.currentUser.activeTimeEntryId === timeEntry._id;
    };

  });
