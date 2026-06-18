# Salesforce Integration Guide - Insurance Gateway

This document explains how to integrate the deployed external Insurance Gateway API with Salesforce CareSphere using Apex HTTP Callouts.

## 1. Remote Site Settings
Before making callouts, add the deployed Gateway URL to Salesforce Remote Site Settings.
- **Name:** InsuranceGateway
- **URL:** `https://caresphere-insurance.onrender.com` (Replace with your actual Render URL)

## 2. Named Credential Setup
Create a Named Credential to manage the base URL securely.
- **Label:** Insurance Gateway
- **Name:** Insurance_Gateway
- **URL:** `https://caresphere-insurance.onrender.com/api/v1`
- **Identity Type:** Named Principal
- **Authentication Protocol:** Anonymous (or Password Authentication if using Named Credential for JWT directly, but typically we handle JWT login in Apex and pass it to the header).

## 3. Apex Callout Example

This example demonstrates authenticating to get a token, and immediately using it to verify a policy.

```apex
public class InsuranceGatewayService {
    
    private static final String BASE_URL = 'callout:Insurance_Gateway'; 
    // Or hardcoded: 'https://caresphere-insurance.onrender.com/api/v1'
    
    // 1. Method to get JWT Token
    public static String loginAndGetToken() {
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + '/auth/login');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        
        // Use the admin credentials seeded by our node.js seed script
        String payload = '{"username": "salesforce_agent", "password": "sfdcpassword123"}';
        req.setBody(payload);
        
        HttpResponse res = http.send(req);
        if (res.getStatusCode() == 200) {
            Map<String, Object> result = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            return (String) result.get('token');
        }
        return null;
    }
    
    // 2. Method to Verify Insurance
    public static void verifyPolicy(String policyNumber) {
        String token = loginAndGetToken();
        if (token == null) {
            System.debug('Authentication Failed');
            return;
        }
        
        Http http = new Http();
        HttpRequest req = new HttpRequest();
        req.setEndpoint(BASE_URL + '/insurance/verify');
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('Authorization', 'Bearer ' + token);
        
        String payload = '{"policyNumber": "' + policyNumber + '"}';
        req.setBody(payload);
        
        try {
            HttpResponse res = http.send(req);
            if (res.getStatusCode() == 200) {
                // Parse the response
                InsuranceResponse wrapper = (InsuranceResponse) JSON.deserialize(res.getBody(), InsuranceResponse.class);
                System.debug('Coverage Status: ' + wrapper.coverageStatus);
                System.debug('Available Balance: ' + wrapper.availableBalance);
            } else {
                System.debug('Error: ' + res.getStatusCode() + ' ' + res.getBody());
            }
        } catch (Exception e) {
            System.debug('Callout Exception: ' + e.getMessage());
        }
    }
}
```

## 4. JSON Parsing Example (Apex Wrapper)

Use this wrapper class to strongly type the JSON response from the `/insurance/verify` endpoint.

```apex
public class InsuranceResponse {
    public String policyNumber { get; set; }
    public String policyHolderName { get; set; }
    public String provider { get; set; }
    public String coverageStatus { get; set; }
    public Decimal approvedClaimLimit { get; set; }
    public Decimal availableBalance { get; set; }
    public Date policyStartDate { get; set; }
    public Date policyExpiryDate { get; set; }
    public String planType { get; set; }
}
```

## 5. Queueable Integration Pattern

For asynchronous processing, such as verifying a policy precisely when a new `Patient` or `Admission` record is inserted, invoke the callout from a Queueable context.

```apex
public class InsuranceVerificationQueueable implements Queueable, Database.AllowsCallouts {
    
    private String policyNumber;
    private Id recordId;
    
    public InsuranceVerificationQueueable(String policyNum, Id sfRecordId) {
        this.policyNumber = policyNum;
        this.recordId = sfRecordId;
    }
    
    public void execute(QueueableContext context) {
        // Perform Callout
        InsuranceGatewayService.verifyPolicy(this.policyNumber);
        
        // Example: Update Salesforce Record based on the response
        // Note: modify the verifyPolicy method to return the wrapper, then:
        // Patient__c p = new Patient__c(Id = this.recordId, Status__c = wrapper.coverageStatus);
        // update p;
    }
}

// How to Enqueue the job from a Trigger:
// System.enqueueJob(new InsuranceVerificationQueueable('POL1001', trigger.new[0].Id));
```

## 6. Error Handling Strategy
- **401 Unauthorized:** The JWT token expired or was invalid. 
- **404 Not Found:** The policy number wasn't found in the Render/Atlas database.
- **500 Server Error:** Review the Audit Logs inside MongoDB Atlas to see the failure reason.
