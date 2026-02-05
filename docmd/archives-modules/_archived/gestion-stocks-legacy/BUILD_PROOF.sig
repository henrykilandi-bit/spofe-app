SPOFE BUILD_PROOF SIGNATURE
=============================

Timestamp: 2026-02-02T16:30:47.000Z
BUILD_PROOF Hash: ef5c43e35bfa73d80b7bc108d7bfd706ad88ecaa142a44c7876209a8cf9808b4
Public Key Fingerprint: 0b523bdbc4a28eae
Signed By: Votre Nom <votre.email@exemple.com>
SPOFE Version: v1.1.0

Signature:
SPOFE-DEMO-MKbAqVDMdRAuIDjePG0OwaUQNaB2kQG2cR8QntaVt9g=

---
This signature authenticates the BUILD_PROOF.md file according to SPOFE v1.1.0 rules.
Verify with: openssl dgst -sha256 -verify public.pem -signature BUILD_PROOF.sig BUILD_PROOF.md
