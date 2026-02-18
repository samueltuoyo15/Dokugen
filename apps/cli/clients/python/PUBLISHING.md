# Publishing Dokugen Python Client

Follow these steps to publish your package to PyPI.

## 1. Install `uv`
First, you need to install `uv` (our build tool).

**Windows (PowerShell):**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**Linux/macOS:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

After installation, **restart your terminal**.

## 2. Create a PyPI Account
1. Go to [https://pypi.org/account/register/](https://pypi.org/account/register/) and create an account.
2. Verify your email address.
3. **IMPORTANT:** Enable **Two-Factor Authentication (2FA)**. PyPI requires this now. use an app like Google Authenticator.

## 3. Generate an API Token
1. Go to your **Account Settings** on PyPI.
2. Scroll down to **API tokens**.
3. Click **Add API token**.
4. Set the **Token name** to something like `dokugen-cli`.
5. Set the **Scope** to "Entire account (all projects)" (since this is your first publish).
6. Click **Add token**.
7. **COPY THE TOKEN IMMEDIATELY!** It starts with `pypi-`. Save it somewhere safe. You won't see it again.

## 4. Build and Publish
Run these commands in your `apps/cli/clients/python` directory:

```bash
# 1. Build the package
uv build

# 2. Publish to PyPI
uv publish
```

When asked for credentials:
- **Username:** `__token__` (literally type this)
- **Password:** [Paste your API token starting with pypi-...]

## 5. Verify Installation
After publishing, anyone can install your tool:

```bash
pip install dokugen
# or
uv tool install dokugen
```
