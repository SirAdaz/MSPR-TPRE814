import hudson.model.*
import jenkins.model.*
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import hudson.plugins.git.*
import hudson.plugins.git.extensions.impl.*
import hudson.triggers.SCMTrigger

def jenkins = Jenkins.get()
def jobName = "futurekawa-pipeline"

if (jenkins.getItem(jobName) == null) {
    def job = jenkins.createProject(WorkflowJob, jobName)
    def scm = new GitSCM(
        GitSCM.createRepoList("file:///workspace/project", null),
        [new BranchSpec("*/main")],
        false,
        [],
        null,
        null,
        [new LocalBranch("main")]
    )
    def definition = new CpsScmFlowDefinition(scm, "Jenkinsfile")
    definition.setLightweight(true)
    job.setDefinition(definition)
    job.addTrigger(new SCMTrigger("H/5 * * * *"))
    job.save()
    println("Created Jenkins job: ${jobName}")
}
