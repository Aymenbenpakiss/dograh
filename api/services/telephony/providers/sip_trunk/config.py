"""SIP-trunk configuration schemas."""

from typing import Literal, Optional

from pydantic import BaseModel, Field, model_validator


class SipTrunkConfigurationRequest(BaseModel):
    """Save-request schema for a tenant's SIP trunk.

    Two auth modes are supported:
      - ``userpass`` (default): standard SIP REGISTER with username + password.
      - ``ip_whitelist``: the SIP provider whitelists our outbound IP; no
        REGISTER, no credentials. ``sip_username`` and ``sip_password`` must
        be omitted or empty in this mode.
    """

    provider: Literal["sip_trunk"] = Field(default="sip_trunk")
    sip_server: str = Field(..., description="host[:port] of the SIP provider")
    auth_mode: Literal["userpass", "ip_whitelist"] = Field(
        default="userpass",
        description=(
            "userpass = REGISTER with sip_username + sip_password. "
            "ip_whitelist = SIP provider whitelists our IP, no credentials."
        ),
    )
    sip_username: Optional[str] = Field(
        default=None, description="auth username (required for userpass mode)"
    )
    sip_password: Optional[str] = Field(
        default=None, description="auth password (required for userpass mode)"
    )
    caller_id: str = Field(..., description="E.164 caller-ID to present outbound")
    transport: Literal["udp", "tcp", "tls"] = Field(default="udp")
    max_concurrent_calls: int = Field(default=10, ge=1, le=500)

    @model_validator(mode="after")
    def _validate_auth_fields(self) -> "SipTrunkConfigurationRequest":
        if self.auth_mode == "userpass":
            if not self.sip_username or not self.sip_password:
                raise ValueError(
                    "sip_username and sip_password are required when "
                    "auth_mode is 'userpass'."
                )
        return self


class SipTrunkConfigurationResponse(BaseModel):
    """Response schema. ``sip_password`` is masked by the org-routes layer."""

    provider: Literal["sip_trunk"] = Field(default="sip_trunk")
    sip_server: str
    auth_mode: Literal["userpass", "ip_whitelist"] = "userpass"
    sip_username: Optional[str] = None
    sip_password: Optional[str] = None  # Masked on read
    caller_id: str
    transport: str = "udp"
    max_concurrent_calls: int = 10

    # Server-managed read-only fields surfaced to the UI for the status banner.
    endpoint_name: Optional[str] = None
    registration_status: Optional[str] = None
    registration_last_error: Optional[str] = None
