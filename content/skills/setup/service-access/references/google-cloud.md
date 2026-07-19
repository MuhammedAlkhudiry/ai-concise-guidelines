# Google Cloud

- **Route:** Use `gcloud` for projects, APIs, service accounts, and IAM.
- **Discover:** Run `rtk gcloud auth list` and `rtk gcloud config list`; native state belongs under `~/.config/gcloud/`.
- **Verify:** Run `rtk gcloud projects describe <project-id>`.
- **Repair:** Install the Google Cloud CLI, run `rtk gcloud auth login`, select the project, and enable only the required API. Pause for OAuth or new IAM grants.

