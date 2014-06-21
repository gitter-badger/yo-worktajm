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


/*globals expect, afterEach, beforeEach, spyOn, describe, it, inject, _ */

'use strict';

describe('Service: TimerService, CRUD tests for Project', function () {

  // load the module
  beforeEach(module('yoWorktajmApp'));

  // API
  var httpBackend;
  var timerService, personService;
  var scope;

  // Test constants
  var projects;
  var timeEntries;
  var persons;
  var customers;

  // Inject the required services
  beforeEach(inject(function (TimerService, PersonService, $httpBackend, $rootScope) {
    timerService = TimerService;
    personService = PersonService;
    httpBackend = $httpBackend;
    scope = $rootScope;

    // Test constants
    projects = [
      { id: 301, name: 'Project A' },
      { id: 302, name: 'Project B' }
    ];
    timeEntries = [
      { id: 201, startTime: 0, endTime: 1381337488*1000, project: projects[0] },
      { id: 202, startTime: 0, endTime: 2 }
    ];
    persons = [
      { id: 1, username: 'User A', activeTimeEntry: null },
      { id: 2, username: 'User B' },
      { id: 3, username: 'User C', activeTimeEntry: timeEntries[0] }
    ];
    customers = [
      { id: 1, name: 'Customer A'},
      { id: 2, name: 'Customer B'}
    ];

  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('Test empty lists', function() {

    it('should return empty list when project list has not been refreshProjected/initialized', function () {
      // Test setup
      spyOn(timerService, 'getProjects').and.callThrough();

      // Test
      var result = timerService.getProjects();

      // Make the requests go though
      scope.$digest();

      // Verifications
      expect(timerService.getProjects).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.length).toBe(0);
    });
  });

  describe('CRUD tests with an initialized project list', function() {
    beforeEach(function () {
      httpBackend.whenGET('http://worktajm.arnellconsulting.dyndns.org:8080/worktajm-api/customer').respond([]);
      httpBackend.whenGET('http://worktajm.arnellconsulting.dyndns.org:8080/worktajm-api/project').respond(_.clone(projects));
      spyOn(timerService, 'getProjects').and.callThrough();
      spyOn(timerService, 'reloadProject').and.callThrough();
      spyOn(scope, '$broadcast').and.callThrough();
      timerService.reloadProject();
      // Must let the timerService process the reloadProject
      scope.$digest();
      httpBackend.flush();
    });

    it('should return project list when project list has been refreshProjected/initialized', function () {
      var result = timerService.getProjects();

      // Verifications
      expect(timerService.reloadProject).toHaveBeenCalled();
      expect(timerService.getProjects).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.length).toBe(2);
      expect(scope.$broadcast).toHaveBeenCalledWith('onProjectsRefreshed', result);
    });

    it('should get the project with the provided id', function () {
      var result = timerService.getProject(302);
      expect(result).not.toBeNull();
      expect(result).toBeDefined();
      expect(result.id).toBe(302);
    });

    it('should remove the project with the provided id', function () {
      var projectId = 302;
      // Assure project exists before removing it
      var projectToBeRemoved = timerService.getProject(projectId);
      expect(projectToBeRemoved.id).toBe(projectId);
      // Remove project
      httpBackend.whenDELETE('http://worktajm.arnellconsulting.dyndns.org:8080/worktajm-api/project/302').respond(201);
      timerService.deleteProject(projectToBeRemoved);
      // Make the requests go though
      scope.$digest();
      httpBackend.flush();
      // Verify it is gone      
      var negative = timerService.getProject(projectId);
      expect(negative).toBeUndefined();
    });

    it('should update the provided project', function () {
      var projectId = 302;
      var successful = false;

      // First get the project
      var project = timerService.getProject(projectId);
      expect(project.id).toBe(projectId);
      // Update it
      httpBackend.whenPUT('http://worktajm.arnellconsulting.dyndns.org:8080/worktajm-api/project/302').respond();
      timerService.updateProject(project).then(function () {
        successful = true;
      });
      // Make the requests go though
      scope.$digest();
      httpBackend.flush();
      // Verify
      expect(successful).toBe(true);
    });

    it('should update the provided project that has a customer name set', function () {
      var projectId = 302;
      var successful = false;

      // First get the project
      var project = timerService.getProject(projectId);
      expect(project.id).toBe(projectId);
      // Update it
      httpBackend.whenPUT('http://worktajm.arnellconsulting.dyndns.org:8080/worktajm-api/project/302').respond();
      timerService.updateProject(project).then(function () {
        successful = true;
      });
      // Make the requests go though
      scope.$digest();
      httpBackend.flush();
      // Verify
      expect(successful).toBe(true);
    });

    it('should update the provided project that has a customer name empty', function () {
      var successful = false;

      // First get the project
      var customerWithoutCustomerName = projects[1];
      var projectWithCustomerName = {
        customerName: ''
      };
      _.extend(projectWithCustomerName, customerWithoutCustomerName);

      // Update it
      httpBackend.whenPUT('http://worktajm.arnellconsulting.dyndns.org:8080/worktajm-api/project/302').respond(customerWithoutCustomerName);
      timerService.updateProject(projectWithCustomerName).then(function () {
        successful = true;
      });

      // Make the requests go though
      scope.$digest();
      httpBackend.flush();

      // Verify
      expect(successful).toBe(true);
    });

    it('should create a new project when project has no id', function () {
      var project = { name: 'New project' };
      var result;
      var error;

      // Create the proejct
      spyOn(timerService, 'updateProject').and.callThrough();
      httpBackend.whenPOST('http://worktajm.arnellconsulting.dyndns.org:8080/worktajm-api/project').respond(projects[1]);
      timerService.updateProject(project).then(function (r) {
        result = r;
      }, function (m) {
        error = m;
      });

      // Make the requests go though
      scope.$digest();
      httpBackend.flush();

      // Verify it now was created  
      expect(timerService.updateProject).toHaveBeenCalledWith(project);
      expect(error).toBeUndefined();
      expect(result.id).toBe(projects[1].id);
      expect(scope.$broadcast).toHaveBeenCalledWith('onProjectCreated', result);
    });

    it('should mark the project as active', function () {
      var projectId = 302;
      var project = timerService.getProject(projectId);
      expect(project.id).toBe(projectId);
      expect(project.active).toBe(false);
      // The test
      timerService.setActive(project, true);
      expect(project.active).toBe(true);
    });

    describe('findProjectByName', function () {
      it('should find a project with existing name', function () {
        var project = timerService.findProjectByName(projects[0].name);
        expect(project.name).toBe(projects[0].name);
      });

      it('should not find a project that doesnt exist', function () {
        var project = timerService.findProjectByName('projects[0].name');
        expect(project).toBeUndefined();
      });
    });

  });
});
