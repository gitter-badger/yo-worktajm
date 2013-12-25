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

describe('Service: CustomerService', function () {

  // load the service's module
  beforeEach(module('yoWorktajmApp'));

  // instantiate service
  var httpBackend;
  var customerService;
  var personService;
  var scope;

  // Test constants
  var newCustomer = {
    companyName: 'Company Name',
    billingAddress: {
      line1: 'Line 1',
      line2: 'Line 2',
      city: 'Sometown'
    },
    referencePerson: 'Reference Person'
  };
  var customerA = {
    id: 1,
    companyName: 'Company Name A',
    billingAddress: {
      line1: 'Line 1',
      line2: 'Line 2',
      city: 'Sometown'
    },
    referencePerson: 'Reference Person'
  };
  var customerB = {
    id: 2,
    companyName: 'Company Name B',
    billingAddress: {
      line1: 'Line 1',
      line2: 'Line 2',
      city: 'Sometown'
    },
    referencePerson: 'Reference Person'
  };
  var customers = [
    customerA,
    customerB
  ];

  beforeEach(inject(function (PersonService, CustomerService, $httpBackend, $rootScope) {
    customerService = CustomerService;
    personService = PersonService;
    httpBackend = $httpBackend;
    scope = $rootScope;

    // Assume we are logged in as user id 1
    PersonService.personId = 1;
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('create / update tests', function () {
    it('should create a new customer', function () {
      // Setup
      httpBackend.whenPOST('http://worktajm.arnellconsulting.dyndns.org:8080/api/api/customer').respond(_.clone(customerA));
      spyOn(customerService, 'save').andCallThrough();
      spyOn(customerService, 'create').andCallThrough();
      spyOn(customerService, 'update').andCallThrough();

      // Test
      var result;
      var failMessage;
      customerService.save(_.clone(newCustomer)).then(function (r) {
        result = r;
      }, function (msg) {
        failMessage = msg;
      });
      scope.$digest();
      httpBackend.flush();
      
      // Validation
      expect(customerService.save).toHaveBeenCalledWith(newCustomer);
      expect(customerService.create).toHaveBeenCalledWith(newCustomer);
      expect(result.id).toBe(customerA.id);
      expect(failMessage).toBeUndefined();
    });

    it('should try to create a new customer but get an error from backend', function () {
      // Setup
      httpBackend.whenPOST('http://worktajm.arnellconsulting.dyndns.org:8080/api/api/customer').respond(401);
      spyOn(customerService, 'save').andCallThrough();
      spyOn(customerService, 'create').andCallThrough();
      spyOn(customerService, 'update').andCallThrough();

      // Test
      var result;
      var failMessage;
      customerService.save(_.clone(newCustomer)).then(function (r) {
        result = r;
      }, function (msg) {
        failMessage = msg;
      });
      scope.$digest();
      httpBackend.flush();
      
      // Validation
      expect(customerService.save).toHaveBeenCalledWith(newCustomer);
      expect(customerService.create).toHaveBeenCalledWith(newCustomer);
      expect(result).toBeUndefined();
      expect(failMessage.status).toBe(401);
    });

    it('should update a customer', function () {
      // Setup
      httpBackend.whenPUT('http://worktajm.arnellconsulting.dyndns.org:8080/api/api/customer/1').respond(_.clone(customerA));
      spyOn(customerService, 'save').andCallThrough();
      spyOn(customerService, 'create').andCallThrough();
      spyOn(customerService, 'update').andCallThrough();

      // Test
      var result;
      var failMessage;
      customerService.save(_.clone(customerA)).then(function (r) {
        result = r;
      }, function (msg) {
        failMessage = msg;
      });
      scope.$digest();
      httpBackend.flush();
      
      // Validation
      expect(customerService.save).toHaveBeenCalledWith(customerA);
      expect(customerService.update).toHaveBeenCalledWith(customerA);
      expect(result.id).toBe(customerA.id);
      expect(failMessage).toBeUndefined();
    });

    it('should try to update a customer but get an error from backend', function () {
      // Setup
      httpBackend.whenPUT('http://worktajm.arnellconsulting.dyndns.org:8080/api/api/customer/1').respond(401);
      spyOn(customerService, 'save').andCallThrough();
      spyOn(customerService, 'create').andCallThrough();
      spyOn(customerService, 'update').andCallThrough();

      // Test
      var result;
      var failMessage;
      customerService.save(_.clone(customerA)).then(function (r) {
        result = r;
      }, function (msg) {
        failMessage = msg;
      });
      scope.$digest();
      httpBackend.flush();
      
      // Validation
      expect(customerService.save).toHaveBeenCalledWith(customerA);
      expect(customerService.update).toHaveBeenCalledWith(customerA);
      expect(result).toBeUndefined();
      expect(failMessage.status).toBe(401);
    });
  });

  describe('read tests', function () {
    it('should get the customer with the provided id', function () {
      // Setup
      httpBackend.wheGET('http://worktajm.arnellconsulting.dyndns.org:8080/api/api/customer/1').respond(_.clone(customerA));
      spyOn(customerService, 'get').andCallThrough();

      // Test
      var result;
      var failMessage;
      customerService.get(customerA.id).then(function (r) {
        result = r;
      }, function (msg) {
        failMessage = msg;
      });
      scope.$digest();
      httpBackend.flush();
      
      // Validation
      expect(customerService.get).toHaveBeenCalledWith(1);
      expect(result.id).toBe(customerA.id);
      expect(failMessage).toBeUndefined();
    });
    it('should handle get with invalid id gracefully', function () {
      // Setup
      httpBackend.wheGET('http://worktajm.arnellconsulting.dyndns.org:8080/api/api/customer/1').respond(401);
      spyOn(customerService, 'get').andCallThrough();

      // Test
      var result;
      var failMessage;
      customerService.get(customerA.id).then(function (r) {
        result = r;
      }, function (msg) {
        failMessage = msg;
      });
      scope.$digest();
      httpBackend.flush();
      
      // Validation
      expect(customerService.get).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
      expect(failMessage.status).toBe(401);
    });
  });

});
