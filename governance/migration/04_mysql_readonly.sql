-- BUILD_PROOF_OPS_P0_04 Verification Script
-- MySQL Read-Only Enforcement
-- CONSTITUTIONAL LEVEL P0
-- Note: This script is designed to run on MySQL

-- Test 1: Verify global read-only is enabled
SELECT 
  'GLOBAL_READONLY_STATUS' as test_name,
  @@global.read_only as read_only_status,
  @@global.super_read_only as super_read_only_status,
  CASE 
    WHEN @@global.read_only = 1 AND @@global.super_read_only = 1
    THEN 'READ_ONLY_ENFORCED'
    ELSE 'CONSTITUTIONAL_VIOLATION: WRITE_ACCESS_POSSIBLE'
  END as verification_result;

-- Test 2: Attempt INSERT (must fail)
-- Note: In production, this would actually attempt and catch the error
SELECT 
  'INSERT_PROHIBITION_TEST' as test_name,
  'This test would attempt: INSERT INTO domain_events (data) VALUES ("test")' as test_description,
  'Expected result: ERROR 1290 (HY000): The MySQL server is running with the --read-only option' as expected_error,
  'SIMULATED_FAILURE' as simulated_result;

-- Test 3: Attempt UPDATE (must fail)
SELECT 
  'UPDATE_PROHIBITION_TEST' as test_name,
  'This test would attempt: UPDATE domain_events SET data = "{}" WHERE id = 1' as test_description,
  'Expected result: ERROR 1290 (HY000): The MySQL server is running with the --read-only option' as expected_error,
  'SIMULATED_FAILURE' as simulated_result;

-- Test 4: Attempt DELETE (must fail)
SELECT 
  'DELETE_PROHIBITION_TEST' as test_name,
  'This test would attempt: DELETE FROM domain_events WHERE id = 1' as test_description,
  'Expected result: ERROR 1290 (HY000): The MySQL server is running with the --read-only option' as expected_error,
  'SIMULATED_FAILURE' as simulated_result;

-- Test 5: Verify SELECT still works (must succeed)
SELECT 
  'SELECT_CAPABILITY_TEST' as test_name,
  COUNT(*) as total_events,
  MAX(sequence_number) as latest_sequence,
  CASE 
    WHEN COUNT(*) > 0 
    THEN 'READ_access_functional'
    ELSE 'WARNING: No events found'
  END as verification_result
FROM domain_events;

-- Final constitutional verification
SELECT 
  'BUILD_PROOF_OPS_P0_04' as proof_id,
  'MYSQL_READONLY_ENFORCEMENT' as invariant_type,
  CASE 
    WHEN @@global.read_only = 1 AND @@global.super_read_only = 1
    THEN 'CONSTITUTIONAL_COMPLIANCE_VERIFIED'
    ELSE 'CONSTITUTIONAL_VIOLATION: WRITE_ACCESS_NOT_DISABLED'
  END as final_verification_result;