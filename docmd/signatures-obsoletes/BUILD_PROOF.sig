SPOFE BUILD_PROOF SIGNATURE
=============================

Timestamp: 2026-02-04T01:36:06.156Z
BUILD_PROOF Hash: 5be25d6d74a6c66980b4cd213320d5822f2144a251381696a5bfd8bd5f67ffc3
Public Key Fingerprint: 95bf97ea41cfa196
Signed By: Votre Nom <votre.email@exemple.com>
SPOFE Version: v1.1.0

Signature:
SPOFE-DEMO-F/5dEy7BzHyx+p4E3tR5T0CF1CSajbuzbSUIE5RhZwI=

---
This signature authenticates the BUILD_PROOF.md file according to SPOFE v1.1.0 rules.
Verify with: openssl dgst -sha256 -verify public.pem -signature BUILD_PROOF.sig BUILD_PROOF.md
