admin = function (action) {
  if (delta.state == null) {
    delta.state = {};
  }
  delta.state.adminAction = action;
}