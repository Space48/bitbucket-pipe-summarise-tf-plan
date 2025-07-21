# Bitbucket Pipe: Summarise Terraform Plan

A Bitbucket Pipe to generate markdown summaries of Terraform plan files from your CI pipeline.

---

## Usage

Add the following step to your `bitbucket-pipelines.yml`:

```yaml
- pipe: space48/bitbucket-pipe-summmarise-tf-plan:latest
  variables:
    INPUT_FILES: "*.tfplan.json"
    OUTPUT_FILE: "terraform-summary.md"
```

## Variables

| Variable    | Required | Description                                         |
| ----------- | -------- | --------------------------------------------------- |
| INPUT_FILES | Yes      | Glob pattern to match Terraform plan JSON files     |
| OUTPUT_FILE | Yes      | Path to output markdown file containing the summary |

## Examples

### Basic example

Generate a summary of all Terraform plan files in the current directory:

```yaml
- pipe: space48/bitbucket-pipe-summmarise-tf-plan:latest
  variables:
    INPUT_FILES: "*.tfplan.json"
    OUTPUT_FILE: "terraform-summary.md"
```

### Advanced example

Process multiple plan files from different directories and generate a comprehensive summary:

```yaml
- pipe: space48/bitbucket-pipe-summmarise-tf-plan:latest
  variables:
    INPUT_FILES: "**/*.tfplan.json"
    OUTPUT_FILE: "infra-changes.md"
```

### Integration with PR comments

Combine with the PR comment pipe to post Terraform summaries directly to pull requests:

```yaml
- pipe: space48/bitbucket-pipe-summmarise-tf-plan:latest
  variables:
    INPUT_FILES: "*.tfplan.json"
    OUTPUT_FILE: "terraform-summary.md"

- pipe: space48/bitbucket-pipe-pr-comment:latest
  variables:
    BITBUCKET_USERNAME: $BITBUCKET_USERNAME
    BITBUCKET_APP_PASSWORD: $BITBUCKET_APP_PASSWORD
    CONTENT_FILE: "terraform-summary.md"
    COMMENT_IDENTIFIER: terraform-plan-summary
```

## Generated Summary Format

The pipe generates markdown summaries with the following structure:

```markdown
## Summary of plan.tfplan.json

**Terraform plan: 2 to create, 1 to update, 0 to delete**

### Resources to create:

    aws_instance.web_server
    aws_security_group.web_sg

### Resources to update:

    aws_s3_bucket.storage
```

## Prerequisites

Terraform plan files must be in JSON format. Generate JSON plan files using:

```sh
terraform plan -out=plan.tfplan && terraform show -json plan.tfplan > plan.tfplan.json
```

## License

MIT licensed, see [LICENSE.txt](LICENSE.txt) for more details.

---

For more information, see the [pipe.yml](pipe.yml) metadata file and the [Bitbucket Pipes documentation](https://support.atlassian.com/bitbucket-cloud/docs/create-a-pipe/).
