## Summary

What does this change do, and why?

## Related issue

Fixes #<issue-number> (if applicable)

## Testing

Describe how you tested the change:

- [ ] Rebuilt and started the container (`./install.sh`)
- [ ] Web UI loads and login page works
- [ ] Collectors start (`docker logs <container> | grep nfsend`)
- [ ] Data folders (`nfsen-data/`, `nfsen-stat/`, `nfsen-var/`, `nfsen-etc/`) behave as expected

## Checklist

- [ ] No new dependencies added
- [ ] Existing bind-mount data layout unchanged
- [ ] No vendor branding introduced
- [ ] Commit message is clear and describes what and why
