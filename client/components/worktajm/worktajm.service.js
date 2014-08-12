'use strict';

angular.module('worktajmApp')
  .service('Worktajm', function ($http, $q, socket, Project, TimeEntry, Auth) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var projects = [];
    var timeEntries = [];

    return {
      getMyProjects: function () {
        var deferred = $q.defer();
        $http.get('/api/projects').success(function (projectList) {
          projects = projectList;
          socket.syncUpdates('project', projects);
          deferred.resolve(projects);
        });
        return deferred.promise;
      },

      getTimeEntries: function () {
        var deferred = $q.defer();
        $http.get('/api/timeEntries').success(function (timeEntryList) {
          timeEntries = timeEntryList;
          socket.syncUpdates('timeentry', timeEntries);
          deferred.resolve(timeEntries);
        });
        return deferred.promise;      
      },

      createProject: function (project, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        Project.save(
          {
            name: project.name,
            rate: project.rate,
            description: project.description
          },
          function (project) {
            console.log('Created new project');
            cb(project);
            deferred.resolve(project);
          },
          function (err) {
            console.log('Failed to created project');
            cb(err);
            deferred.reject(err);
          }
        );

        return deferred.promise;
      },

      updateProject: function (project, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();

        Project.save(
          project,
          function (project) {
            console.log('Updated project');
            cb(project);
            deferred.resolve(project);
          },
          function (err) {
            console.log('Failed to update project');
            cb(err);
            deferred.reject(err);
          }
        );

        return deferred.promise;
      },

      restoreProject: function (project, callback) {
        var cb = callback || angular.noop;        
        var deferred = $q.defer();

        Project.get(
          {
            id: project._id
          },
          function (restoredProject) {
            console.log('Restored project');
            _.assign(project, restoredProject);
            cb(restoredProject);
            deferred.resolve(restoredProject);
          },
          function (err) {
            console.log('Failed to restore project');
            cb(err);
            deferred.reject(err);
          }
        );

        return deferred.promise;
      },

      deleteProject: function (project, callback) {
        console.log('deleteProject - id [%s]', project._id);
        var cb = callback || angular.noop;        
        var deferred = $q.defer();

        Project.delete(
          {
            id: project._id
          },
          function (project) {
            console.log('Deleted project');
            cb(project);
            deferred.resolve(project);
          },
          function (err) {
            console.log('Failed to delete project');
            cb(err);
            deferred.reject(err);
          }
        );
        return deferred.promise;
      },

      startTimer: function (project) {
        console.log('startTimer - id [%s]', project._id);
        var user = Auth.getCurrentUser();
        console.log('current user is ', user);

        // Create new time entry (for given project)
        this.createTimeEntry(project);
        // updateCurrentUser();
      },

      stopTimer: function (project) {
        console.log('stopTimer - id [%s]', project._id);
      },

      createTimeEntry: function (project) {
        TimeEntry.save(
          {
            project: project._id,
            startTime: '2014-07-21T08:00:00.000Z'
          },
          function () {
            console.log('Created time entry');
          },
          function () {
            console.log('Failed to create time entry');
          });
      },

      deleteTimeEntry: function (timeEntry, callback) {
        console.log('deleteTimeEntry - id [%s]', timeEntry._id);
        var cb = callback || angular.noop;        
        var deferred = $q.defer();

        TimeEntry.delete(
          {
            id: timeEntry._id
          },
          function (timeEntry) {
            console.log('Deleted time entry');
            cb(timeEntry);
            deferred.resolve(timeEntry);
          },
          function (err) {
            console.log('Failed to delete time entry');
            cb(err);
            deferred.reject(err);
          }
        );
        return deferred.promise;        
      }

    };
  });