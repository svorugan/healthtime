# EC2 SSH Connection Troubleshooting Guide

## Quick Diagnosis Checklist

### 1. Verify Instance Status
- [ ] Go to EC2 Console → Instances
- [ ] Instance State: **Running** (green)
- [ ] Status Checks: **2/2 checks passed** (may take 2-5 minutes for new instances)

### 2. Check Security Group (MOST COMMON ISSUE)

**Steps:**
1. EC2 Console → Select your instance
2. Click **Security** tab
3. Click on the security group name
4. Click **Edit inbound rules**
5. Verify SSH rule exists:
   - **Type**: SSH
   - **Protocol**: TCP
   - **Port**: 22
   - **Source**: 0.0.0.0/0 (for testing) or Your IP

**If missing, add it:**
- Click **Add rule**
- Type: SSH
- Port: 22
- Source: My IP (recommended) or 0.0.0.0/0 (for testing)
- Click **Save rules**

### 3. Get Connection Details

**Find your instance details:**
1. EC2 Console → Select instance
2. Note down:
   - **Public IPv4 address**: (e.g., 54.123.45.67)
   - **Key pair name**: (shown in instance details)
   - **AMI**: Ubuntu Server 22.04 LTS

### 4. Connection Methods

#### Method A: EC2 Instance Connect (Browser-based)

**Requirements:**
- Security group must allow SSH from AWS Instance Connect IPs
- For **us-east-1**: Add inbound rule with source `18.206.107.24/29`
- For **us-east-2**: Add inbound rule with source `3.16.146.0/29`
- For other regions, check: https://ip-ranges.amazonaws.com/ip-ranges.json

**Steps:**
1. EC2 Console → Select instance
2. Click **Connect** button (top right)
3. Choose **EC2 Instance Connect** tab
4. Username: `ubuntu` (for Ubuntu AMI)
5. Click **Connect**

#### Method B: SSH from Windows PowerShell (RECOMMENDED)

**Requirements:**
- Your `.pem` key file
- Instance public IP

**Command:**
```powershell
ssh -i "C:\path\to\your-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

**Example:**
```powershell
ssh -i "C:\Users\YourName\Downloads\healthtime-key.pem" ubuntu@54.123.45.67
```

**If you get "Permissions are too open" error:**
1. Right-click the `.pem` file → Properties → Security
2. Click **Advanced** → **Disable inheritance**
3. Remove all users except yourself
4. Apply and try again

#### Method C: PuTTY (Alternative for Windows)

1. Download PuTTY and PuTTYgen
2. Convert `.pem` to `.ppk` using PuTTYgen
3. Use PuTTY to connect with the `.ppk` file

### 5. Common Error Messages

#### "Connection timed out"
**Cause**: Security group not allowing SSH
**Fix**: Add SSH inbound rule (see step 2)

#### "Permission denied (publickey)"
**Cause**: Wrong key or wrong username
**Fix**: 
- Verify you're using the correct `.pem` file
- For Ubuntu AMI, use username `ubuntu`
- For Amazon Linux, use username `ec2-user`

#### "Failed to connect to your instance" (Instance Connect)
**Cause**: Instance Connect IPs not allowed in security group
**Fix**: 
- Add AWS Instance Connect IP ranges to security group
- OR use Method B (direct SSH) instead

#### "Host key verification failed"
**Cause**: SSH key mismatch (if you terminated and recreated instance with same IP)
**Fix**: 
```powershell
# Remove old key from known_hosts
ssh-keygen -R YOUR_EC2_PUBLIC_IP
```

### 6. Verify After Connection

Once connected, verify the setup:

```bash
# Check system info
uname -a
cat /etc/os-release

# Check if instance is ready
df -h
free -m

# Check network
ip addr show
curl -s http://169.254.169.254/latest/meta-data/public-ipv4
```

## Step-by-Step: First Time Connection

### For Brand New Instance:

1. **Wait 2-3 minutes** after launching for initialization
2. **Check Status Checks**: Must show 2/2 passed
3. **Verify Security Group**: Must have SSH (port 22) inbound rule
4. **Get Public IP**: From EC2 Console instance details
5. **Locate your .pem file**: The key you selected/created during launch
6. **Connect via PowerShell**:
   ```powershell
   ssh -i "path\to\your-key.pem" ubuntu@YOUR_PUBLIC_IP
   ```

### First Login Commands:

```bash
# Update system
sudo apt update

# Verify you can become root
sudo -i
exit

# Check available disk space
df -h

# Check memory
free -m

# You're ready to proceed with deployment!
```

## Security Group Configuration Example

**Minimal configuration for development:**

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | My IP | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | TCP | 443 | 0.0.0.0/0 | Secure web |
| Custom TCP | TCP | 8000 | 0.0.0.0/0 | Backend API |

**For production, restrict sources appropriately!**

## Still Having Issues?

### Check AWS Service Health
- Visit: https://status.aws.amazon.com/
- Verify EC2 service is operational in your region

### Review System Logs
1. EC2 Console → Select instance
2. **Actions** → **Monitor and troubleshoot** → **Get system log**
3. Look for boot errors

### Try Session Manager (Alternative)
If SSH completely fails:
1. Attach IAM role with `AmazonSSMManagedInstanceCore` policy
2. Install SSM agent (pre-installed on Amazon Linux 2 and Ubuntu 16.04+)
3. Use **Session Manager** from EC2 Console → Connect

## Quick Reference

**Ubuntu AMI default username**: `ubuntu`  
**Amazon Linux AMI default username**: `ec2-user`  
**SSH port**: 22  
**Default SSH command**: `ssh -i "key.pem" ubuntu@PUBLIC_IP`  

## Next Steps After Successful Connection

Once connected, proceed with:
1. System updates: `sudo apt update && sudo apt upgrade -y`
2. Install required software (Node.js, Nginx, PostgreSQL)
3. Deploy your application

Refer to `AWS_SETUP.md` for complete deployment instructions.
